"use server"

import { createQuestionAction } from "@/actions/questions-actions"
import { revalidatePath } from "next/cache"

export async function handleCreateQuestion(userId: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const body = formData.get("body") as string
    const tags = JSON.parse(formData.get("tags") as string)

    const newFormData = new FormData()
    newFormData.set("title", title)
    newFormData.set("body", body)
    tags.forEach((tag: any) => newFormData.append("tags", tag.name))

    const res = await createQuestionAction(newFormData)

    if (!res.isSuccess) {
      throw new Error(res.message)
    }

    revalidatePath("/qna")
  } catch (error) {
    console.error("Error creating question:", error)
    throw error
  }
} 