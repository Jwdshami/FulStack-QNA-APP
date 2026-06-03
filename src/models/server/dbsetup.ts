import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";
import { databases } from "./config";

let isInitialized = false; // ← guard

export default async function getOrCreateDB() {
  if (isInitialized) return databases; // ← skip if already done

  try {
    await databases.get(db)
    console.log("Database connected")
  } catch (error) {
    try {
      await databases.create(db, db)
      console.log("Database created")
      await Promise.all([
        createQuestionCollection(),
        createAnswerCollection(),
        createCommentCollection(),
        createVoteCollection(),
      ])
      console.log("Collections created")
    } catch (error) {
      console.log("Error creating database or collections", error)
    }
  }

  isInitialized = true; // ← mark done
  return databases;
}