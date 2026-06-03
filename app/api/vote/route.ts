import { answersCollection, db, questionsCollection, votesCollection } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { UserPrefs } from "@/src/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import voteCollection from "@/src/models/server/vote.collection";
import answerCollection from "@/src/models/server/answer.collection";
import questionCollection from "@/src/models/server/question.collection";

export async function POST(request: NextRequest) {
    try {
        const { votedById, voteStatus, type, typeId } = await request.json();

        const response = await databases.listDocuments(db, votesCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
        ]);

        if (response.documents.length > 0) {
            await databases.deleteDocument(db, votesCollection, response.documents[0].$id);

            // Decrease the reputation of the question/answer author
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

        // that means prev vote does not exists or voteStatus changed
        if (response.documents[0]?.voteStatus !== voteStatus) {
            const doc = await databases.createDocument(db, votesCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            });

            // Increate/Decrease the reputation of the question/answer author accordingly
            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionsCollection : answersCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            // if vote was present
            if (response.documents[0]) {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                        response.documents[0].voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) - 1
                            : Number(authorPrefs.reputation) + 1,
                });
            } else {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                        voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) + 1
                            : Number(authorPrefs.reputation) - 1,
                });
            }

            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.equal("votedById", votedById),
                    Query.limit(1), // for optimization as we only need total
                ]),
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.equal("votedById", votedById),
                    Query.limit(1), // for optimization as we only need total
                ]),
            ]);

            return NextResponse.json(
                {
                    data: { document: doc, voteResult: upvotes.total - downvotes.total },
                    message: response.documents[0] ? "Vote Status Updated" : "Voted",
                },
                {
                    status: 201,
                }
            );
        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, votesCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.equal("votedById", votedById),
                Query.limit(1), // for optimization as we only need total
            ]),
            databases.listDocuments(db, votesCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.equal("votedById", votedById),
                Query.limit(1), // for optimization as we only need total
            ]),
        ]);

        return NextResponse.json(
            {
                data: { 
                    document: null, voteResult: upvotes.total - downvotes.total 
                },
                message: "Vote Withdrawn",
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Error deleting answer" },
            { status: error?.status || error?.code || 500 }
        );
    }
}
