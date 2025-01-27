"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { ActionState } from "@/types"
import { InsertApiKey, SelectApiKey } from "@/db/schema"
import {
  getApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey
} from "@/db/queries/api-keys-queries"

export async function getApiKeysAction(): Promise<ActionState<SelectApiKey[]>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const apiKeys = await getApiKeys()
    return {
      isSuccess: true,
      message: "API keys retrieved successfully",
      data: apiKeys
    }
  } catch (error) {
    console.error("Error getting API keys:", error)
    return { isSuccess: false, message: "Failed to get API keys" }
  }
}

export async function getApiKeyByIdAction(
  id: string
): Promise<ActionState<SelectApiKey | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const apiKey = await getApiKeyById(id)
    return {
      isSuccess: true,
      message: "API key retrieved successfully",
      data: apiKey
    }
  } catch (error) {
    console.error("Error getting API key:", error)
    return { isSuccess: false, message: "Failed to get API key" }
  }
}

export async function createApiKeyAction(
  formData: FormData
): Promise<ActionState<SelectApiKey>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const expiresAt = formData.get("expiresAt") as string

    if (!name) {
      return {
        isSuccess: false,
        message: "Name is required"
      }
    }

    const apiKey = await createApiKey({
      name,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    })

    revalidatePath("/admin/api-keys")
    return {
      isSuccess: true,
      message: "API key created successfully",
      data: apiKey
    }
  } catch (error) {
    console.error("Error creating API key:", error)
    return { isSuccess: false, message: "Failed to create API key" }
  }
}

export async function updateApiKeyAction(
  id: string,
  formData: FormData
): Promise<ActionState<SelectApiKey>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const expiresAt = formData.get("expiresAt") as string
    const isActive = formData.get("isActive") === "true"

    if (!name) {
      return {
        isSuccess: false,
        message: "Name is required"
      }
    }

    const apiKey = await updateApiKey(id, {
      name,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive
    })

    revalidatePath("/admin/api-keys")
    return {
      isSuccess: true,
      message: "API key updated successfully",
      data: apiKey
    }
  } catch (error) {
    console.error("Error updating API key:", error)
    return { isSuccess: false, message: "Failed to update API key" }
  }
}

export async function deleteApiKeyAction(id: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    await deleteApiKey(id)
    revalidatePath("/admin/api-keys")
    return {
      isSuccess: true,
      message: "API key deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting API key:", error)
    return { isSuccess: false, message: "Failed to delete API key" }
  }
} 