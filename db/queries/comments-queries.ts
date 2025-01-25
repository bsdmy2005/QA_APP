import { db } from "@/db/db"
import { commentsTable } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"

export async function getComments(parentId: string, parentType: "question" | "answer") {
  return await db.query.comments.findMany({
    where: and(
      eq(commentsTable.parentId, parentId),
      eq(commentsTable.parentType, parentType)
    ),
    orderBy: desc(commentsTable.createdAt)
  })
}

export async function getCommentById(id: string) {
  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id))
  return comment
}

export async function getCommentsByUserId(userId: string) {
  return await db.query.comments.findMany({
    where: eq(commentsTable.userId, userId),
    orderBy: desc(commentsTable.createdAt)
  })
}

export async function createComment(data: {
  parentId: string
  parentType: "question" | "answer"
  userId: string
  body: string
}) {
  const [comment] = await db
    .insert(commentsTable)
    .values(data)
    .returning()
  return comment
}

export async function updateComment(
  id: string,
  data: {
    body: string
  }
) {
  const [comment] = await db
    .update(commentsTable)
    .set(data)
    .where(eq(commentsTable.id, id))
    .returning()
  return comment
}

export async function deleteComment(id: string) {
  const [comment] = await db
    .delete(commentsTable)
    .where(eq(commentsTable.id, id))
    .returning()
  return comment
} 