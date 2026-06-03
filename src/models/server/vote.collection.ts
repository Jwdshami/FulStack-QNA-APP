import { Permission, Role } from "node-appwrite";
import { db, votesCollection } from "../name";
import { databases } from "./config";

export default async function createVoteCollection() {
  // Creating Collection
  await databases.createCollection(db, votesCollection, votesCollection, [
    Permission.create(Role.users()),
    Permission.read(Role.any()),
    Permission.read(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]);
  console.log("Vote Collection Created");

  // Creating Attributes
  await Promise.all([
    databases.createEnumAttribute(
      db,
      votesCollection,
      "type",
      ["question", "answer"],
      true,
    ),
    databases.createStringAttribute(db, votesCollection, "typeId", 50, true),
    databases.createEnumAttribute(
      db,
      votesCollection,
      "voteStatus",
      ["upvoted", "downvoted"],
      true,
    ),
    databases.createStringAttribute(db, votesCollection, "votedById", 50, true),
  ]);
  console.log("Vote Attributes Created");
}
