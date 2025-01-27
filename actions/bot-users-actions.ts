"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
  getBotUsers,
  getBotUserById,
  createBotUser,
  updateBotUser,
  deleteBotUser
} from "@/db/queries/bot-users-queries"
import { ActionState } from "@/types"
import { SelectBotUser } from "@/db/schema"

export async function getBotUsersAction(): Promise<ActionState<SelectBotUser[]>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const botUsers = await getBotUsers()
    return {
      isSuccess: true,
      message: "Bot users retrieved successfully",
      data: botUsers
    }
  } catch (error) {
    console.error("Error getting bot users:", error)
    return { isSuccess: false, message: "Failed to get bot users" }
  }
}

export async function getBotUserByIdAction(
  id: string
): Promise<ActionState<SelectBotUser | null>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const botUser = await getBotUserById(id)
    return {
      isSuccess: true,
      message: "Bot user retrieved successfully",
      data: botUser
    }
  } catch (error) {
    console.error("Error getting bot user:", error)
    return { isSuccess: false, message: "Failed to get bot user" }
  }
}

export async function createBotUserAction(
  formData: FormData
): Promise<ActionState<SelectBotUser>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const botAppName = formData.get("botAppName") as string
    const botAppUserId = formData.get("botAppUserId") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const mappedUserId = formData.get("userId") as string

    const botUser = await createBotUser({
      botAppName,
      botAppUserId,
      userId: mappedUserId,
      name,
      email
    })

    revalidatePath("/admin/bot-users")
    return {
      isSuccess: true,
      message: "Bot user created successfully",
      data: botUser
    }
  } catch (error) {
    console.error("Error creating bot user:", error)
    return { isSuccess: false, message: "Failed to create bot user" }
  }
}

export async function updateBotUserAction(
  id: string,
  formData: FormData
): Promise<ActionState<SelectBotUser>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    const botAppName = formData.get("botAppName") as string
    const botAppUserId = formData.get("botAppUserId") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const mappedUserId = formData.get("userId") as string

    const botUser = await updateBotUser(id, {
      botAppName,
      botAppUserId,
      userId: mappedUserId,
      name,
      email
    })

    revalidatePath("/admin/bot-users")
    return {
      isSuccess: true,
      message: "Bot user updated successfully",
      data: botUser
    }
  } catch (error) {
    console.error("Error updating bot user:", error)
    return { isSuccess: false, message: "Failed to update bot user" }
  }
}

export async function deleteBotUserAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Not authenticated" }
    }

    await deleteBotUser(id)
    revalidatePath("/admin/bot-users")
    return {
      isSuccess: true,
      message: "Bot user deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting bot user:", error)
    return { isSuccess: false, message: "Failed to delete bot user" }
  }
} 