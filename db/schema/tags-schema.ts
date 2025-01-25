import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { questionsTable } from "./questions-schema"

export const tagsTable = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Bridging table for Questions <-> Tags
export const questionTagsTable = pgTable("question_tags", {
  questionId: uuid("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tagsTable.id, { onDelete: "cascade" })
    .notNull()
})

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  questionTags: many(questionTagsTable)
}))

export const questionTagsRelations = relations(questionTagsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [questionTagsTable.questionId],
    references: [questionsTable.id]
  }),
  tag: one(tagsTable, {
    fields: [questionTagsTable.tagId],
    references: [tagsTable.id]
  })
}))

export type InsertTag = typeof tagsTable.$inferInsert
export type SelectTag = typeof tagsTable.$inferSelect 