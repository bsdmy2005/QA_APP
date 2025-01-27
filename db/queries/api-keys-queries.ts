"use server"

import { db } from "@/db/db"
import { apiKeysTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

interface CreateApiKeyData {
  name: string
  expiresAt: Date | null
}

interface UpdateApiKeyData extends CreateApiKeyData {
  isActive: boolean
}

export async function getApiKeys() {
  return db.select().from(apiKeysTable).orderBy(apiKeysTable.createdAt)
}

export async function getApiKeyById(id: string) {
  const [apiKey] = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.id, id))
  return apiKey
}

export async function createApiKey(data: CreateApiKeyData) {
  const [apiKey] = await db
    .insert(apiKeysTable)
    .values({
      ...data,
      key: `qak_${nanoid()}`
    })
    .returning()
  return apiKey
}

export async function updateApiKey(id: string, data: UpdateApiKeyData) {
  const [apiKey] = await db
    .update(apiKeysTable)
    .set(data)
    .where(eq(apiKeysTable.id, id))
    .returning()
  return apiKey
}

export async function deleteApiKey(id: string) {
  await db.delete(apiKeysTable).where(eq(apiKeysTable.id, id))
} 