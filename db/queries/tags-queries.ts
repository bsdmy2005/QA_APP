import { db } from "@/db/db"
import { tagsTable, questionTagsTable } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function getTags() {
  return await db.select().from(tagsTable).orderBy(desc(tagsTable.createdAt))
}

export async function getTagById(id: string) {
  const [tag] = await db
    .select()
    .from(tagsTable)
    .where(eq(tagsTable.id, id))
  return tag
}

export async function getTagsByQuestionId(questionId: string) {
  const results = await db
    .select({
      tag: tagsTable
    })
    .from(questionTagsTable)
    .innerJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
    .where(eq(questionTagsTable.questionId, questionId))
  return results.map(result => result.tag)
}

export async function createTag(name: string) {
  const [tag] = await db
    .insert(tagsTable)
    .values({ name })
    .returning()
  return tag
}

export async function addTagToQuestion(questionId: string, tagId: string) {
  const [questionTag] = await db
    .insert(questionTagsTable)
    .values({ questionId, tagId })
    .returning()
  return questionTag
}

export async function removeTagFromQuestion(questionId: string, tagId: string) {
  const [questionTag] = await db
    .delete(questionTagsTable)
    .where(
      eq(questionTagsTable.questionId, questionId) && 
      eq(questionTagsTable.tagId, tagId)
    )
    .returning()
  return questionTag
}
    
export async function updateTag(id: string, name: string) {
  const [tag] = await db
    .update(tagsTable)
    .set({ name })
    .where(eq(tagsTable.id, id))
    .returning()
  return tag
}

export async function deleteTag(id: string) {
  const [tag] = await db
    .delete(tagsTable)
    .where(eq(tagsTable.id, id))
    .returning()
  return tag
} 