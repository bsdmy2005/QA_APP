import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { getProfileByIdAction, createProfileAction } from "@/actions/profiles-actions"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (body.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to get existing profile
    const profileResult = await getProfileByIdAction(userId)
    if (profileResult.isSuccess && profileResult.data) {
      return NextResponse.json({
        isAdmin: profileResult.data.role === "admin"
      })
    }

    // Create new profile if doesn't exist
    const createResult = await createProfileAction({
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: "user",
      membership: "free"
    })

    if (!createResult.isSuccess || !createResult.data) {
      throw new Error("Failed to create profile")
    }

    return NextResponse.json({
      isAdmin: createResult.data.role === "admin"
    })
  } catch (error) {
    console.error("Error in profile init:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 