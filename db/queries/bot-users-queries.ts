import { db } from "@/db/db"
import { botUsersTable, InsertBotUser, SelectBotUser } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getBotUsers(): Promise<SelectBotUser[]> {
  return db.select().from(botUsersTable)
}

export async function getBotUserById(id: string): Promise<SelectBotUser | null> {
  const [botUser] = await db
    .select()
    .from(botUsersTable)
    .where(eq(botUsersTable.id, id))
    .limit(1)
  return botUser || null
}

export async function getBotUserByBotAppId(
  botAppName: string,
  botAppUserId: string
): Promise<SelectBotUser | null> {
  const [botUser] = await db
    .select()
    .from(botUsersTable)
    .where(
      eq(botUsersTable.botAppName, botAppName) && 
      eq(botUsersTable.botAppUserId, botAppUserId)
    )
    .limit(1)
  return botUser || null
}

export async function createBotUser(data: InsertBotUser): Promise<SelectBotUser> {
  const [botUser] = await db.insert(botUsersTable).values(data).returning()
  return botUser
}

export async function updateBotUser(
  id: string,
  data: Partial<InsertBotUser>
): Promise<SelectBotUser> {
  const [botUser] = await db
    .update(botUsersTable)
    .set(data)
    .where(eq(botUsersTable.id, id))
    .returning()
  return botUser
}

export async function deleteBotUser(id: string): Promise<void> {
  await db.delete(botUsersTable).where(eq(botUsersTable.id, id))
} 