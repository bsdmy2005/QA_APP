import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { questionsTable } from "./questions-schema"

export const imagesTable = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questionsTable.id, { onDelete: "cascade" }).notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertImage = typeof imagesTable.$inferInsert
export type SelectImage = typeof imagesTable.$inferSelect 