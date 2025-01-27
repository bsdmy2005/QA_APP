import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { answersTable } from "./answers-schema"

export const answerMappingsTable = pgTable("answer_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Our system's answer ID
  answerId: uuid("answer_id")
    .references(() => answersTable.id, { onDelete: "cascade" })
    .notNull(),
  // External system's answer ID
  externalAnswerId: text("external_answer_id").notNull(),
  // External system's user ID who created the answer
  externalUserId: text("external_user_id").notNull(),
  // External system's user name who created the answer
  externalUserName: text("external_user_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertAnswerMapping = typeof answerMappingsTable.$inferInsert
export type SelectAnswerMapping = typeof answerMappingsTable.$inferSelect 