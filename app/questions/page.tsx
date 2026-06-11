import { databases, users } from "@/src/models/server/config";
import { answersCollection, db, votesCollection, questionsCollection } from "@/src/models/name";
import { Query } from "node-appwrite";
import React, { Suspense } from "react";  // ✅ Import Suspense
import Link from "next/link";
import ShimmerButton from "@/src/components/magicui/shimmer-button";
import QuestionCard from "@/src/components/QuestionCard";
import { UserPrefs } from "@/src/store/Auth";
import Pagination from "@/src/components/Pagination";
import Search from "./Search";

// ✅ Fix searchParams as Promise (Next.js 15+)
const Page = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tag?: string; search?: string }>;
}) => {
    const params = await searchParams;
    params.page ||= "1";

    const queries = [
        Query.orderDesc("$createdAt"),
        Query.offset((+params.page - 1) * 25),
        Query.limit(25),
    ];

    if (params.tag) queries.push(Query.equal("tags", params.tag));
    if (params.search)
        queries.push(
            Query.or([
                Query.search("title", params.search),
                Query.search("content", params.search),
            ])
        );

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
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Questions</h1>
                <Link href="/questions/ask">
                    <ShimmerButton className="shadow-2xl">
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                            Ask a question
                        </span>
                    </ShimmerButton>
                </Link>
            </div>
            <div className="mb-4">
                <Suspense fallback={<div>Loading search...</div>}>  {/* ✅ Wrap Search */}
                    <Search />
                </Suspense>
            </div>
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {questions.documents.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques as any} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;