import { Permission, Role } from "node-appwrite";
import { answersCollection, db } from "../name";
import { databases } from "./config";

export default async function createAnswerCollection(): Promise<void> {
  // Creating Collection
  await databases.createCollection(db, answersCollection, answersCollection, [
    Permission.create(Role.users()),
    Permission.read(Role.any()),
    Permission.read(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]);
  console.log("Answer Collection Created");

  // Creating Attributes
  await Promise.all([
    databases.createStringAttribute(
      db,
      answersCollection,
      "content",
      10000,
      true,
    ),
    databases.createStringAttribute(
      db,
      answersCollection,
      "questionId",
      50,
      true,
    ),
    databases.createStringAttribute(
      db,
      answersCollection,
      "authorId",
      50,
      true,
    ),
  ]);
  console.log("Answer Attributes Created");
}
