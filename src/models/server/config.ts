import {env} from "@/app/env";
import {
  Client,
  Databases,
  Storage,
  Avatars,
  Account,
  Users,
} from "node-appwrite";

const client = new Client();

client
  .setEndpoint(env.appwriteEndpoint)
  .setProject(env.appwriteProjectId)
  .setKey(env.appwriteApiKey);

const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const account = new Account(client);
const users = new Users(client);

export { client, databases, storage, avatars, account, users };