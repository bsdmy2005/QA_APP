import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { questionsTable } from "./questions-schema"

export const questionMappingsTable = pgTable("question_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Our system's question ID
  questionId: uuid("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  // External system's question ID
  externalQuestionId: text("external_question_id").notNull(),
  // External system's user ID who created the question
  externalUserId: text("external_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertQuestionMapping = typeof questionMappingsTable.$inferInsert
export type SelectQuestionMapping = typeof questionMappingsTable.$inferSelect 