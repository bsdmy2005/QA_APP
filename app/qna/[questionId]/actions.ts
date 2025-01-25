"use server"

import { createAnswerAction } from "@/actions/answers-actions"
import { revalidatePath } from "next/cache"

export async function handleCreateAnswer(questionId: string, userId: string, formData: FormData) {
  const body = formData.get("body") as string

  if (!body) {
    throw new Error("Answer body is required")
  }

  const result = await createAnswerAction({
    questionId,
    userId,
    body
  })

  if (!result.isSuccess) {
    throw new Error(result.message)
  }

  revalidatePath(`/qna/${questionId}`)
} 