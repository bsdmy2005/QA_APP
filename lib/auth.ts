import { NextRequest } from "next/server"
import { db } from "@/db/db"
import { apiKeysTable } from "@/db/schema"
import { eq } from "drizzle-orm"

interface ApiKeyVerificationResult {
  isValid: boolean
  apiKey?: {
    id: string
    key: string
  }
}

export async function verifyApiKey(
  req: NextRequest
): Promise<ApiKeyVerificationResult> {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return { isValid: false }
    }

    const key = authHeader.split(" ")[1]
    if (!key) {
      return { isValid: false }
    }

    const [apiKey] = await db
      .select({
        id: apiKeysTable.id,
        key: apiKeysTable.key,
        isActive: apiKeysTable.isActive,
        expiresAt: apiKeysTable.expiresAt
      })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.key, key))

    if (!apiKey) {
      return { isValid: false }
    }

    if (!apiKey.isActive) {
      return { isValid: false }
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { isValid: false }
    }

    // Update last used timestamp
    await db
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, apiKey.id))

    return {
      isValid: true,
      apiKey: {
        id: apiKey.id,
        key: apiKey.key
      }
    }
  } catch (error) {
    console.error("Error verifying API key:", error)
    return { isValid: false }
  }
} 