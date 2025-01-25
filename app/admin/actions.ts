"use server"

import { deleteQuestionAction } from "@/actions/questions-actions"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction
} from "@/actions/categories-actions"
import {
  createTagAction,
  updateTagAction,
  deleteTagAction
} from "@/actions/tags-actions"
import { revalidatePath } from "next/cache"

export async function handleDeleteQuestion(questionId: string) {
  await deleteQuestionAction(questionId)
  revalidatePath("/admin")
}

export async function handleCreateCategory(name: string) {
  await createCategoryAction(name)
  revalidatePath("/admin")
}

export async function handleUpdateCategory(id: string, name: string) {
  await updateCategoryAction(id, name)
  revalidatePath("/admin")
}

export async function handleDeleteCategory(id: string) {
  await deleteCategoryAction(id)
  revalidatePath("/admin")
}

export async function handleCreateTag(name: string) {
  await createTagAction(name)
  revalidatePath("/admin")
}

export async function handleUpdateTag(id: string, name: string) {
  await updateTagAction(id, name)
  revalidatePath("/admin")
}

export async function handleDeleteTag(id: string) {
  await deleteTagAction(id)
  revalidatePath("/admin")
} 