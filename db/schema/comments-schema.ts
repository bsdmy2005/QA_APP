import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core"

export const commentParentTypeEnum = pgEnum("comment_parent_type", ["question", "answer"])

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentType: commentParentTypeEnum("parent_type").notNull(),
  parentId: uuid("parent_id").notNull(),
  userId: text("user_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

export type InsertComment = {
  parentType: "question" | "answer"
  parentId: string
  userId: string
  body: string
}

export type SelectComment = typeof commentsTable.$inferSelect 