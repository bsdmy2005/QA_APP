"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
  acceptAnswer,
  createAnswer,
  deleteAnswer,
  getAnswerById,
  getAnswers,
  getAnswersByUserId,
  unacceptAnswer,
  updateAnswer,
  voteAnswer,
  getUserVoteForAnswer,
  type AnswerWithUser
} from "@/db/queries/answers-queries"
import { ActionState } from "@/types"

export async function getAnswersAction(
  questionId: string
): Promise<ActionState<AnswerWithUser[]>> {
  try {
    const answers = await getAnswers(questionId)
    return {
      isSuccess: true,
      message: "Answers retrieved successfully",
      data: answers
    }
  } catch (error) {
    console.error("Error getting answers:", error)
    return { isSuccess: false, message: "Failed to get answers" }
  }
}

export async function getAnswerByIdAction(
  id: string
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const answer = await getAnswerById(id)
    return {
      isSuccess: true,
      message: "Answer retrieved successfully",
      data: answer
    }
  } catch (error) {
    console.error("Error getting answer:", error)
    return { isSuccess: false, message: "Failed to get answer" }
  }
}

export async function getAnswersByUserIdAction(
  userId: string
): Promise<ActionState<AnswerWithUser[]>> {
  try {
    const answers = await getAnswersByUserId(userId)
    return {
      isSuccess: true,
      message: "Answers retrieved successfully",
      data: answers
    }
  } catch (error) {
    console.error("Error getting answers:", error)
    return { isSuccess: false, message: "Failed to get answers" }
  }
}

export async function createAnswerAction(data: {
  questionId: string
  body: string
}): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const answer = await createAnswer({
      ...data,
      userId
    })

    revalidatePath(`/qna/${data.questionId}`)
    return {
      isSuccess: true,
      message: "Answer created successfully",
      data: answer
    }
  } catch (error) {
    console.error("Error creating answer:", error)
    return { isSuccess: false, message: "Failed to create answer" }
  }
}

export async function updateAnswerAction(
  id: string,
  data: {
    body?: string
  }
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const answer = await getAnswerById(id)
    if (!answer) {
      return { isSuccess: false, message: "Answer not found" }
    }

    if (answer.userId !== userId) {
      return { isSuccess: false, message: "Not authorized" }
    }

    const updatedAnswer = await updateAnswer(id, data)

    revalidatePath(`/qna/${answer.questionId}`)
    return {
      isSuccess: true,
      message: "Answer updated successfully",
      data: updatedAnswer
    }
  } catch (error) {
    console.error("Error updating answer:", error)
    return { isSuccess: false, message: "Failed to update answer" }
  }
}

export async function deleteAnswerAction(
  id: string
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const answer = await getAnswerById(id)
    if (!answer) {
      return { isSuccess: false, message: "Answer not found" }
    }

    if (answer.userId !== userId) {
      return { isSuccess: false, message: "Not authorized" }
    }

    await deleteAnswer(id)

    revalidatePath(`/qna/${answer.questionId}`)
    return {
      isSuccess: true,
      message: "Answer deleted successfully",
      data: answer
    }
  } catch (error) {
    console.error("Error deleting answer:", error)
    return { isSuccess: false, message: "Failed to delete answer" }
  }
}

export async function voteAnswerAction(
  id: string,
  value: 1 | -1
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const updatedAnswer = await voteAnswer(id, userId, value)
    if (!updatedAnswer) {
      return { isSuccess: false, message: "Failed to vote answer" }
    }

    revalidatePath(`/qna/${updatedAnswer.questionId}`)
    return {
      isSuccess: true,
      message: "Answer voted successfully",
      data: updatedAnswer
    }
  } catch (error) {
    console.error("Error voting answer:", error)
    return { isSuccess: false, message: "Failed to vote answer" }
  }
}

export async function getUserVoteForAnswerAction(
  answerId: string
): Promise<ActionState<number | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const vote = await getUserVoteForAnswer(answerId, userId)

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

export async function acceptAnswerAction(
  id: string
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const answer = await getAnswerById(id)
    if (!answer) {
      return { isSuccess: false, message: "Answer not found" }
    }

    const updatedAnswer = await acceptAnswer(id)

    revalidatePath(`/qna/${answer.questionId}`)
    return {
      isSuccess: true,
      message: "Answer accepted successfully",
      data: updatedAnswer
    }
  } catch (error) {
    console.error("Error accepting answer:", error)
    return { isSuccess: false, message: "Failed to accept answer" }
  }
}

export async function unacceptAnswerAction(
  id: string
): Promise<ActionState<AnswerWithUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const answer = await getAnswerById(id)
    if (!answer) {
      return { isSuccess: false, message: "Answer not found" }
    }

    const updatedAnswer = await unacceptAnswer(id)

    revalidatePath(`/qna/${answer.questionId}`)
    return {
      isSuccess: true,
      message: "Answer unaccepted successfully",
      data: updatedAnswer
    }
  } catch (error) {
    console.error("Error unaccepting answer:", error)
    return { isSuccess: false, message: "Failed to unaccept answer" }
  }
} 