"use server"

import { ActionState } from "@/types"
import { SelectComment } from "@/db/schema"
import {
  getComments,
  getCommentById,
  getCommentsByUserId,
  createComment,
  updateComment,
  deleteComment
} from "@/db/queries/comments-queries"

export async function getCommentsAction(
  parentId: string,
  parentType: "question" | "answer"
): Promise<ActionState<SelectComment[]>> {
  try {
    const comments = await getComments(parentId, parentType)
    return {
      isSuccess: true,
      message: "Comments retrieved successfully",
      data: comments
    }
  } catch (error) {
    console.error("Error getting comments:", error)
    return { isSuccess: false, message: "Failed to get comments" }
  }
}

export async function getCommentByIdAction(
  id: string
): Promise<ActionState<SelectComment>> {
  try {
    const comment = await getCommentById(id)
    if (!comment) {
      return { isSuccess: false, message: "Comment not found" }
    }
    return {
      isSuccess: true,
      message: "Comment retrieved successfully",
      data: comment
    }
  } catch (error) {
    console.error("Error getting comment:", error)
    return { isSuccess: false, message: "Failed to get comment" }
  }
}

export async function getCommentsByUserIdAction(
  userId: string
): Promise<ActionState<SelectComment[]>> {
  try {
    const comments = await getCommentsByUserId(userId)
    return {
      isSuccess: true,
      message: "Comments retrieved successfully",
      data: comments
    }
  } catch (error) {
    console.error("Error getting comments:", error)
    return { isSuccess: false, message: "Failed to get comments" }
  }
}

export async function createCommentAction(data: {
  parentId: string
  parentType: "question" | "answer"
  userId: string
  body: string
}): Promise<ActionState<SelectComment>> {
  try {
    const comment = await createComment(data)
    return {
      isSuccess: true,
      message: "Comment created successfully",
      data: comment
    }
  } catch (error) {
    console.error("Error creating comment:", error)
    return { isSuccess: false, message: "Failed to create comment" }
  }
}

export async function updateCommentAction(
  id: string,
  data: {
    body: string
  }
): Promise<ActionState<SelectComment>> {
  try {
    const comment = await updateComment(id, data)
    return {
      isSuccess: true,
      message: "Comment updated successfully",
      data: comment
    }
  } catch (error) {
    console.error("Error updating comment:", error)
    return { isSuccess: false, message: "Failed to update comment" }
  }
}

export async function deleteCommentAction(
  id: string
): Promise<ActionState<SelectComment>> {
  try {
    const comment = await deleteComment(id)
    return {
      isSuccess: true,
      message: "Comment deleted successfully",
      data: comment
    }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return { isSuccess: false, message: "Failed to delete comment" }
  }
} 