import { Permission, Role } from "node-appwrite";
import { questionATTACHMENTS_BUCKET } from "../name";
import { storage } from "./config";

let isInitialized = false; // ← ADD THIS

export default async function getOrCreateStorage() {
  if (isInitialized) return storage; // ← ADD THIS

  try {
    await storage.getBucket(questionATTACHMENTS_BUCKET);
    console.log("Storage Connected");
  } catch (error) {
    try {
      await storage.createBucket(
        questionATTACHMENTS_BUCKET,
        questionATTACHMENTS_BUCKET,
        [
          Permission.create(Role.users()),
          Permission.read(Role.any()),
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "gif", "jpeg", "webp", "heic"],
      );
      console.log("Storage Created");
      console.log("Storage Connected");
    } catch (error) {
      console.error("Error creating storage:", error);
    }
  }

  isInitialized = true; // ← ADD THIS
}