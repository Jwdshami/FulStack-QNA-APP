import {
  Permission,
  Role,
  DatabasesIndexType,
} from "node-appwrite";

import { databases } from "./config";
import { db, questionsCollection } from "../name";

export default async function createQuestionCollection() {
  try {
    await databases.createCollection(
      db,
      questionsCollection,
      questionsCollection,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );

    console.log("Question collection created successfully");
  } catch (error) {
    console.log("Collection may already exist:", error);
  }

  try {
    await Promise.all([
      databases.createStringAttribute(
        db,
        questionsCollection,
        "title",
        255,
        true
      ),

      databases.createStringAttribute(
        db,
        questionsCollection,
        "content",
        65535,
        true
      ),

      databases.createStringAttribute(
        db,
        questionsCollection,
        "authorId",
        255,
        true
      ),

      databases.createStringAttribute(
        db,
        questionsCollection,
        "tags",
        50,
        true,
        undefined,
        true
      ),

      databases.createStringAttribute(
        db,
        questionsCollection,
        "attachmentId",
        50,
        false
      ),
    ]);

    console.log("Attributes created successfully");

  

    // await databases.createIndex(
    //   db,
    //   questionsCollection,
    //   "title_content_index",
    //   DatabasesIndexType.Fulltext,
    //   ["title"]
    // );

    console.log("Index created successfully");
  } catch (error) {
    console.error("Error creating attributes/index:", error);
  }
}