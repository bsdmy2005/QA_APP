"use server"

import { db } from "@/db/db"
import { tagsTable, questionTagsTable, SelectTag } from "@/db/schema"
import { ActionState } from "@/types"
import { desc, eq, sql } from "drizzle-orm"

// Get all tags for autocomplete, ordered by usage count
export async function getTagsAction(): Promise<ActionState<SelectTag[]>> {
  try {
    const tags = await db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        usageCount: tagsTable.usageCount,
        createdAt: tagsTable.createdAt,
        updatedAt: tagsTable.updatedAt
      })
      .from(tagsTable)
      .orderBy(desc(tagsTable.usageCount), desc(tagsTable.createdAt))

    return {
      isSuccess: true,
      message: "Tags retrieved successfully",
      data: tags
    }
  } catch (error) {
    console.error("Error getting tags:", error)
    return { isSuccess: false, message: "Failed to get tags" }
  }
}

// Create a new tag if it doesn't exist
export async function createTagAction(name: string): Promise<ActionState<SelectTag>> {
  try {
    // Normalize tag name
    const normalizedName = name.toLowerCase().trim()

    // Check if tag already exists (case insensitive)
    const [existingTag] = await db
      .select()
      .from(tagsTable)
      .where(sql`LOWER(${tagsTable.name}) = ${normalizedName}`)
      .limit(1)

    if (existingTag) {
      return {
        isSuccess: true,
        message: "Tag already exists",
        data: existingTag
      }
    }

    // Create new tag
    const [newTag] = await db.insert(tagsTable)
      .values({
        name: normalizedName,
        usageCount: 0
      })
      .returning()

    return {
      isSuccess: true,
      message: "Tag created successfully",
      data: newTag
    }
  } catch (error) {
    console.error("Error creating tag:", error)
    return { isSuccess: false, message: "Failed to create tag" }
  }
}

// Update a tag
export async function updateTagAction(
  id: string,
  name: string
): Promise<ActionState<SelectTag>> {
  try {
    const normalizedName = name.toLowerCase().trim()

    // Check if another tag exists with the same name
    const [existingTag] = await db
      .select()
      .from(tagsTable)
      .where(sql`LOWER(${tagsTable.name}) = ${normalizedName} AND ${tagsTable.id} != ${id}`)
      .limit(1)

    if (existingTag) {
      return {
        isSuccess: false,
        message: "A tag with this name already exists"
      }
    }

    const [updatedTag] = await db
      .update(tagsTable)
      .set({
        name: normalizedName,
        updatedAt: new Date()
      })
      .where(eq(tagsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Tag updated successfully",
      data: updatedTag
    }
  } catch (error) {
    console.error("Error updating tag:", error)
    return { isSuccess: false, message: "Failed to update tag" }
  }
}

// Delete a tag
export async function deleteTagAction(id: string): Promise<ActionState<SelectTag>> {
  try {
    const [deletedTag] = await db
      .delete(tagsTable)
      .where(eq(tagsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Tag deleted successfully",
      data: deletedTag
    }
  } catch (error) {
    console.error("Error deleting tag:", error)
    return { isSuccess: false, message: "Failed to delete tag" }
  }
}

// Increment tag usage count when used in a question
export async function incrementTagUsageAction(tagId: string): Promise<ActionState<void>> {
  try {
    await db.update(tagsTable)
      .set({ 
        usageCount: sql`${tagsTable.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(tagsTable.id, tagId))

    return {
      isSuccess: true,
      message: "Tag usage incremented successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error incrementing tag usage:", error)
    return { isSuccess: false, message: "Failed to increment tag usage" }
  }
}

// Get tags for a specific question
export async function getQuestionTagsAction(questionId: string): Promise<ActionState<SelectTag[]>> {
  try {
    const tags = await db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        usageCount: tagsTable.usageCount,
        createdAt: tagsTable.createdAt,
        updatedAt: tagsTable.updatedAt
      })
      .from(questionTagsTable)
      .innerJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
      .where(eq(questionTagsTable.questionId, questionId))

    return {
      isSuccess: true,
      message: "Question tags retrieved successfully",
      data: tags
    }
  } catch (error) {
    console.error("Error getting question tags:", error)
    return { isSuccess: false, message: "Failed to get question tags" }
  }
} 