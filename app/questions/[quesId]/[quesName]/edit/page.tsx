import { db, questionsCollection } from "@/src/models/name";
import { databases } from "@/src/models/server/config";
import React from "react";
import EditQues from "./EditQues";

const Page = async ({ params }: { params: { quesId: string; quesName: string } }) => {
    const question = await databases.getDocument(db, questionsCollection, params.quesId);

    return <EditQues question={question} />;
};

export default Page;
