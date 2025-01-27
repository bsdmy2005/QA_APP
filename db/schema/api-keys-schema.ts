import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core"

export const apiKeysTable = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertApiKey = typeof apiKeysTable.$inferInsert
export type SelectApiKey = typeof apiKeysTable.$inferSelect 