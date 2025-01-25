import { boolean, pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"
import { categoriesTable } from "./categories-schema"
import { answersTable } from "./answers-schema"
import { tagsTable, questionTagsTable } from "./tags-schema"
import { profilesTable } from "./profiles-schema"

export const questionVotesTable = pgTable("question_votes", {
  questionId: uuid("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categoriesTable.id, { onDelete: "set null" })
    .default(sql`null`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  images: text("images"),  // Comma-separated URLs for images
  votes: integer("votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export const questionsRelations = relations(questionsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [questionsTable.categoryId],
    references: [categoriesTable.id],
  }),
  answers: many(answersTable),
  questionTags: many(questionTagsTable),
  user: one(profilesTable, {
    fields: [questionsTable.userId],
    references: [profilesTable.userId]
  }),
  votes: many(questionVotesTable)
}))

export const questionVotesRelations = relations(questionVotesTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [questionVotesTable.questionId],
    references: [questionsTable.id]
  }),
  user: one(profilesTable, {
    fields: [questionVotesTable.userId],
    references: [profilesTable.userId]
  })
}))

export type InsertQuestion = typeof questionsTable.$inferInsert
export type SelectQuestion = typeof questionsTable.$inferSelect 