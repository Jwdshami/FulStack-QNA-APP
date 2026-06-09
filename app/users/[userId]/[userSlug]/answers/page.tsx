import Pagination from "@/src/components/Pagination";
import { MarkdownPreview } from "@/src/components/RTE";
import { answersCollection, db, questionsCollection } from "@/src/models/name";
import { databases } from "@/src/models/server/config";
import slugify from "@/src/utils/slugify";
import Link from "next/link";
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
    const { userId } = await params;
    const { page = "1" } = await searchParams;

    const queries = [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.offset((+page - 1) * 25),
        Query.limit(25),
    ];

    const answers = await databases.listDocuments(db, answersCollection, queries);

    answers.documents = await Promise.all(
        answers.documents.map(async ans => {
            const question = await databases.getDocument(db, questionsCollection, ans.questionId, [
                Query.select(["title"]),
            ]);
            return { ...ans, question };
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{answers.total} answers</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {answers.documents.map(ans => (
                    <div key={ans.$id}>
                        <div className="max-h-40 overflow-auto">
                            <MarkdownPreview source={ans.content} className="rounded-lg p-4" />
                        </div>
                        <Link
                            href={`/questions/${ans.questionId}/${slugify(ans.question.title)}`}
                            className="mt-3 inline-block shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
                        >
                            Question
                        </Link>
                    </div>
                ))}
            </div>
            <Pagination total={answers.total} limit={25} />
        </div>
    );
};

export default Page;