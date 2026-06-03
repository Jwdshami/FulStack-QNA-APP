import { answersCollection, db } from "@/src/models/name";
import { databases, users } from "@/src/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite"; 
import {UserPrefs} from "@/src/store/Auth";
import answerCollection from "@/src/models/server/answer.collection";



export async function POST(request: NextRequest){
  try {
    const {questionId, answer, authorId} = await request.json();

    const response = await databases.createDocument(db, answersCollection, ID.unique(), {
      content: answer,
      authorId: authorId,
      questionId: questionId
    })

    // Increase author reputation
    const prefs = await users.getPrefs<UserPrefs>(authorId)
    await users.updatePrefs(authorId, {
      reputation: Number(prefs.reputation) + 1
    })

    return NextResponse.json(response, {
      status: 201
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer"
      },
      {
        status: error?.status || error?.code || 500
      }
    )
  }
}

export async function DELETE(request: NextRequest){
  try {
    const {answerId} = await request.json()

    const answer = await databases.getDocument(db, answersCollection, answerId)

    const response = await databases.deleteDocument(db, answersCollection, answerId)

    //decrese the reputation
    const prefs = await users.getPrefs<UserPrefs>(answer.authorId)
    await users.updatePrefs(answer.authorId, {
      reputation: Number(prefs.reputation) - 1
    })

    return NextResponse.json(
      {data: response},
      {status: 200}
  )



  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Error deleting the answer"
      },
      {
        status: error?.status || error?.code || 500
      }
    )
  }
}