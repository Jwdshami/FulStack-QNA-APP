import { db, questionsCollection } from "@/src/models/name";
import { databases } from "@/src/models/server/config";
import React from "react";
import EditQues from "./EditQues";
 
// ✅ FIXED: params is now a Promise in Next.js 15+
const Page = async ({ params }: { params: Promise<{ quesId: string; quesName: string }> }) => {
    const { quesId } = await params;
    const question = await databases.getDocument(db, questionsCollection, quesId);
 
    return <EditQues question={question} />;
};
 
export default Page;
 