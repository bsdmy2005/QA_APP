import { pgTable, text, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { questionsTable } from "./questions-schema"
import { profilesTable } from "./profiles-schema"

export const answerVotesTable = pgTable("answer_votes", {
  answerId: uuid("answer_id")
    .references(() => answersTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export const answersTable = pgTable("answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),
  body: text("body").notNull(),
  images: text("images"),  // Comma-separated URLs for images
  votes: integer("votes").default(0).notNull(),
  accepted: boolean("accepted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const answersRelations = relations(answersTable, ({ one, many }) => ({
  question: one(questionsTable, {
    fields: [answersTable.questionId],
    references: [questionsTable.id],
  }),
  user: one(profilesTable, {
    fields: [answersTable.userId],
    references: [profilesTable.userId]
  }),
  votes: many(answerVotesTable)
}))

export const answerVotesRelations = relations(answerVotesTable, ({ one }) => ({
  answer: one(answersTable, {
    fields: [answerVotesTable.answerId],
    references: [answersTable.id]
  }),
  user: one(profilesTable, {
    fields: [answerVotesTable.userId],
    references: [profilesTable.userId]
  })
}))

export type InsertAnswer = typeof answersTable.$inferInsert
export type SelectAnswer = typeof answersTable.$inferSelect 