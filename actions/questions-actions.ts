"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  getQuestionsByUserId,
  updateQuestion,
  voteQuestion,
  getUserVoteForQuestion,
  getQuestionsByTag
} from "@/db/queries/questions-queries"
import { uploadImages, deleteImages } from "@/lib/supabase-storage"
import { ActionState } from "@/types"
import { SelectQuestion } from "@/db/schema"
import { QuestionWithRelations } from "@/types/questions-types"
import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { questionsTable, answersTable } from "@/db/schema"

async function prepareFilesForUpload(files: File[]) {
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      arrayBuffer: new Uint8Array(await file.arrayBuffer())
    }))
  )
}

export async function getQuestionsAction(): Promise<
  ActionState<QuestionWithRelations[]>
> {
  try {
    const questions = await getQuestions()
    return {
      isSuccess: true,
      message: "Questions retrieved successfully",
      data: questions
    }
  } catch (error) {
    console.error("Error getting questions:", error)
    return { isSuccess: false, message: "Failed to get questions" }
  }
}

export async function getQuestionByIdAction(
  id: string
): Promise<ActionState<QuestionWithRelations | null>> {
  try {
    const question = await getQuestionById(id)
    return {
      isSuccess: true,
      message: "Question retrieved successfully",
      data: question
    }
  } catch (error) {
    console.error("Error getting question:", error)
    return { isSuccess: false, message: "Failed to get question" }
  }
}

export async function getQuestionsByUserIdAction(
  userId: string
): Promise<ActionState<QuestionWithRelations[]>> {
  try {
    const questions = await getQuestionsByUserId(userId)
    return {
      isSuccess: true,
      message: "Questions retrieved successfully",
      data: questions
    }
  } catch (error) {
    console.error("Error getting questions:", error)
    return { isSuccess: false, message: "Failed to get questions" }
  }
}

export async function getQuestionsByTagAction(
  tagId: string
): Promise<ActionState<QuestionWithRelations[]>> {
  try {
    const questions = await getQuestionsByTag(tagId)
    return {
      isSuccess: true,
      message: "Questions retrieved successfully",
      data: questions
    }
  } catch (error) {
    console.error("Error getting questions:", error)
    return { isSuccess: false, message: "Failed to get questions" }
  }
}

export async function createQuestionAction(formData: FormData): Promise<ActionState<QuestionWithRelations>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const title = formData.get("title") as string
    const body = formData.get("body") as string
    const categoryId = formData.get("categoryId") as string
    const tags = formData.getAll("tags") as string[]
    const imageFiles = formData.getAll("images") as File[]

    // Upload images if any
    let imageUrls: string[] = []
    if (imageFiles.length > 0) {
      const filesData = await prepareFilesForUpload(imageFiles)
      imageUrls = await uploadImages(filesData)
    }

    const question = await createQuestion({
      userId,
      categoryId,
      title,
      body,
      tags,
      images: imageUrls.length > 0 ? imageUrls.join(",") : undefined
    })

    if (!question) {
      // Clean up uploaded images if question creation fails
      if (imageUrls.length > 0) {
        await deleteImages(imageUrls)
      }
      return { isSuccess: false, message: "Failed to create question" }
    }

    revalidatePath("/qna")
    return {
      isSuccess: true,
      message: "Question created successfully",
      data: question
    }
  } catch (error) {
    console.error("Error creating question:", error)
    return { isSuccess: false, message: "Failed to create question" }
  }
}

export async function updateQuestionAction(
  id: string,
  formData: FormData
): Promise<ActionState<QuestionWithRelations>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const question = await getQuestionById(id)
    if (!question) {
      return { isSuccess: false, message: "Question not found" }
    }

    if (question.userId !== userId) {
      return { isSuccess: false, message: "Not authorized" }
    }

    const title = formData.get("title") as string
    const body = formData.get("body") as string
    const categoryId = formData.get("categoryId") as string
    const tags = formData.getAll("tags") as string[]
    const imageFiles = formData.getAll("images") as File[]
    const existingImages = formData.get("existingImages") as string

    let imageUrls = existingImages ? existingImages.split(",") : []

    // Upload new images if any
    if (imageFiles.length > 0) {
      const filesData = await prepareFilesForUpload(imageFiles)
      const newImageUrls = await uploadImages(filesData)
      imageUrls = [...imageUrls, ...newImageUrls]
    }

    const updatedQuestion = await updateQuestion(id, {
      categoryId,
      title,
      body,
      tags,
      images: imageUrls.length > 0 ? imageUrls.join(",") : undefined
    })

    if (!updatedQuestion) {
      return { isSuccess: false, message: "Failed to update question" }
    }

    revalidatePath("/qna")
    revalidatePath(`/qna/${id}`)
    return {
      isSuccess: true,
      message: "Question updated successfully",
      data: updatedQuestion
    }
  } catch (error) {
    console.error("Error updating question:", error)
    return { isSuccess: false, message: "Failed to update question" }
  }
}

export async function deleteQuestionAction(id: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const question = await getQuestionById(id)
    if (!question) {
      return { isSuccess: false, message: "Question not found" }
    }

    if (question.userId !== userId) {
      return { isSuccess: false, message: "Not authorized" }
    }

    // Delete associated images if any
    if (question.images) {
      await deleteImages(question.images.split(","))
    }

    await deleteQuestion(id)
    revalidatePath("/qna")
    return { isSuccess: true, message: "Question deleted successfully", data: undefined }
  } catch (error) {
    console.error("Error deleting question:", error)
    return { isSuccess: false, message: "Failed to delete question" }
  }
}

export async function voteQuestionAction(
  id: string,
  value: 1 | -1
): Promise<ActionState<SelectQuestion>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const updatedQuestion = await voteQuestion(id, userId, value)

    revalidatePath("/qna")
    revalidatePath(`/qna/${id}`)
    return {
      isSuccess: true,
      message: "Question voted successfully",
      data: updatedQuestion
    }
  } catch (error) {
    console.error("Error voting question:", error)
    return { isSuccess: false, message: "Failed to vote question" }
  }
}

export async function getUserVoteForQuestionAction(
  questionId: string
): Promise<ActionState<number | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const vote = await getUserVoteForQuestion(questionId, userId)

    return {
      isSuccess: true,
      message: "Vote retrieved successfully",
      data: vote
    }
  } catch (error) {
    console.error("Error getting vote:", error)
    return { isSuccess: false, message: "Failed to get vote" }
  }
}

export async function getQuestionsWithRelationsAction(): Promise<ActionState<QuestionWithRelations[]>> {
  try {
    const questions = await db.select().from(questionsTable).leftJoin(
      answersTable,
      eq(answersTable.questionId, questionsTable.id)
    )

    const questionsWithCounts = Object.values(
      questions.reduce((acc, row) => {
        if (!acc[row.questions.id]) {
          acc[row.questions.id] = {
            ...row.questions,
            answers: [],
            category: null
          }
        }
        if (row.answers) {
          acc[row.questions.id].answers.push(row.answers)
        }
        return acc
      }, {} as Record<string, any>)
    )

    return {
      isSuccess: true,
      message: "Questions retrieved successfully",
      data: questionsWithCounts
    }
  } catch (error) {
    console.error("Error getting questions:", error)
    return { isSuccess: false, message: "Failed to get questions" }
  }
} 