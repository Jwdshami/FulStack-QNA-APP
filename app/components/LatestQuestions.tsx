import QuestionCard from "@/src/components/QuestionCard";
import { answersCollection, db, questionsCollection, votesCollection } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { UserPrefs } from "@/src/store/Auth";
import { Query } from "node-appwrite";
import React from "react";

const LatestQuestions = async () => {
    const questions = await databases.listDocuments(db, questionsCollection, [
        Query.limit(5),
        Query.orderDesc("$createdAt"),
    ]);
    console.log("Fetched Questions:", questions);

    questions.documents = await Promise.all(
        questions.documents.map(async ques => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId),
                databases.listDocuments(db, answersCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1), // for optimization
                ]),
                databases.listDocuments(db, votesCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1), // for optimization
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

    console.log("Latest question")
    console.log(questions)
    return (
        <div className="space-y-6">
            {questions.documents.map(question => (
                <QuestionCard key={question.$id} ques={question} />
            ))}
        </div>
    );
};

export default LatestQuestions;
