import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core"

export const categoriesTable = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

export type InsertCategory = {
  name: string
}

export type SelectCategory = typeof categoriesTable.$inferSelect 