import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { questionsTable } from "./questions-schema"
import { answersTable } from "./answers-schema"

export const botQuestionsTable = pgTable("bot_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  botAppName: text("bot_app_name").notNull(),
  botAppQuestionId: text("bot_app_question_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const botAnswersTable = pgTable("bot_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  botAppName: text("bot_app_name").notNull(),
  botAppAnswerId: text("bot_app_answer_id").notNull(),
  answerId: uuid("answer_id")
    .references(() => answersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const botQuestionsRelations = relations(botQuestionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [botQuestionsTable.questionId],
    references: [questionsTable.id]
  })
}))

export const botAnswersRelations = relations(botAnswersTable, ({ one }) => ({
  answer: one(answersTable, {
    fields: [botAnswersTable.answerId],
    references: [answersTable.id]
  })
}))

export type InsertBotQuestion = typeof botQuestionsTable.$inferInsert
export type SelectBotQuestion = typeof botQuestionsTable.$inferSelect

export type InsertBotAnswer = typeof botAnswersTable.$inferInsert
export type SelectBotAnswer = typeof botAnswersTable.$inferSelect 