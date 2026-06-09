import { questionsCollection, db } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/src/store/Auth";
import getOrCreateDB from "@/src/models/server/dbsetup";
import getOrCreateStorage from "@/src/models/server/storage";

export async function POST(request: NextRequest) {
  try {
    await getOrCreateDB();
    await getOrCreateStorage();

    const { title, content, tags, attachmentId, authorId } = await request.json();

    const response = await databases.createDocument(
      db,
      questionsCollection,
      ID.unique(),
      {
        title,
        content,
        tags,
        attachmentId,
        authorId,
      }
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error creating question" },
      { status: error?.status || error?.code || 500 }
    );
  }
}