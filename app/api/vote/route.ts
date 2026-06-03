import { answersCollection, db, questionsCollection, votesCollection } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { UserPrefs } from "@/src/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import getOrCreateDB from "@/src/models/server/dbsetup";
import getOrCreateStorage from "@/src/models/server/storage";

export async function POST(request: NextRequest) {
    try {
        await getOrCreateDB();
        await getOrCreateStorage();

        const { votedById, voteStatus, type, typeId } = await request.json();

        const response = await databases.listDocuments(db, votesCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
        ]);

        if (response.documents.length > 0) {
            await databases.deleteDocument(db, votesCollection, response.documents[0].$id);

            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionsCollection : answersCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                reputation:
                    response.documents[0].voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation) - 1
                        : Number(authorPrefs.reputation) + 1,
            });
        }

        if (response.documents[0]?.voteStatus !== voteStatus) {
            const doc = await databases.createDocument(db, votesCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            });

            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionsCollection : answersCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            if (response.documents[0]) {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        response.documents[0].voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) - 1
                            : Number(authorPrefs.reputation) + 1,
                });
            } else {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) + 1
                            : Number(authorPrefs.reputation) - 1,
                });
            }

            // ✅ Fixed: removed votedById filter so totals are global, not per-user
            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.limit(1),
                ]),
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.limit(1),
                ]),
            ]);

            return NextResponse.json(
                {
                    data: { document: doc, voteResult: upvotes.total - downvotes.total },
                    message: response.documents[0] ? "Vote Status Updated" : "Voted",
                },
                { status: 201 }
            );
        }

        // ✅ Fixed: removed votedById filter here too
        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, votesCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.limit(1),
            ]),
            databases.listDocuments(db, votesCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.limit(1),
            ]),
        ]);

        return NextResponse.json(
            {
                data: { document: null, voteResult: upvotes.total - downvotes.total },
                message: "Vote Withdrawn",
            },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Error voting" },
            { status: error?.status || error?.code || 500 }
        );
    }
}