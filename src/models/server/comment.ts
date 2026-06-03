import { Permission, Role } from "node-appwrite";
import { commentsCollection, db } from "../name";
import { databases } from "./config";

export default async function createCommentCollection() {
  // Creating Collection
  await databases.createCollection(db, commentsCollection, commentsCollection, [
    Permission.create(Role.users()),
    Permission.read(Role.any()),
    Permission.read(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]);
  console.log("Comment Collection Created");

  // Creating Attributes
  await Promise.all([
    databases.createStringAttribute(
      db,
      commentsCollection,
      "content",
      10000,
      true,
    ),
    databases.createEnumAttribute(
      db,
      commentsCollection,
      "type",
      ["answer", "question"],
      true,
    ),
    databases.createStringAttribute(db, commentsCollection, "typeId", 50, true),
    databases.createStringAttribute(
      db,
      commentsCollection,
      "authorId",
      50,
      true,
    ),
  ]);
  console.log("Comment Attributes Created");
}
