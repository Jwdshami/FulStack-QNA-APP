import React from "react";
import { HeroParallax } from "@/src/components/ui/hero-parallax";
import { databases } from "@/src/models/server/config";
import { db, questionATTACHMENTS_BUCKET, questionsCollection } from "@/src/models/name";
import { Query } from "node-appwrite";
import slugify from "@/src/utils/slugify";
import { storage } from "@/src/models/client/config";
import HeroSectionHeader from "./HeroSectionHeader";

export default async function HeroSection() {
    const questions = await databases.listDocuments(db, questionsCollection, [
        Query.orderDesc("$createdAt"),
        Query.limit(15),
    ]);

    return (
        <HeroParallax
            header={<HeroSectionHeader />}
            products={questions.documents.map(q => ({
                title: q.title,
                link: `/questions/${q.$id}/${slugify(q.title)}`,
               thumbnail: storage.getFilePreview(questionATTACHMENTS_BUCKET, q.attachmentId).toString(),
            }))}
        />
    );
}
