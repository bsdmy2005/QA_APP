import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { profilesTable } from "./profiles-schema"

export const botUsersTable = pgTable("bot_users", {
    id: uuid("id").defaultRandom().primaryKey(),


  botAppName: text("bot_app_name").notNull(),
  botAppUserId: text("bot_app_user_id").notNull(),
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull()
    .unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
}, (table) => ({
  uniqueBotAppUser: unique().on(table.botAppName, table.botAppUserId)
}))

export const botUsersRelations = relations(botUsersTable, ({ one }) => ({
  user: one(profilesTable, {
    fields: [botUsersTable.userId],
    references: [profilesTable.userId]
  })
}))

export type InsertBotUser = typeof botUsersTable.$inferInsert
export type SelectBotUser = typeof botUsersTable.$inferSelect 
