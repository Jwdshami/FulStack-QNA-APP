import Pagination from "@/src/components/Pagination";
import QuestionCard from "@/src/components/QuestionCard";
import { answersCollection, db, questionsCollection, votesCollection } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { UserPrefs } from "@/src/store/Auth";
import { Query } from "node-appwrite";
import React from "react";

// ✅ FIXED: params is now a Promise in Next.js 15+
const Page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; userSlug: string }>;
    searchParams: Promise<{ page?: string }>;
}) => {
    const { userId } = await params;  // ✅ Await params
    const { page = "1" } = await searchParams;  // ✅ Await searchParams
    const queries = [
        Query.equal("authorId", userId),  // ✅ Use userId
        Query.orderDesc("$createdAt"),
        Query.offset((+page - 1) * 25),
        Query.limit(25),
    ];

    const questions = await databases.listDocuments(db, questionsCollection, queries);

    questions.documents = await Promise.all(
        questions.documents.map(async ques => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId),
                databases.listDocuments(db, answersCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1),
                ]),
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1),
                ]),
            ]);

            return {
                ...ques,
                totalAnswers: answers.total,
                totalVotes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs.reputation,
                    name: author.name,
                },
            };
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {questions.documents.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;