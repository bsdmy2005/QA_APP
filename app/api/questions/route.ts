import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/db"
import { apiKeysTable, questionMappingsTable, questionsTable, profilesTable } from "@/db/schema"
import { verifyApiKey } from "@/lib/auth"
import { z } from "zod"
import { getBotUserByBotAppId } from "@/db/queries/bot-users-queries"
import { eq } from "drizzle-orm"
import { getProfileById } from "@/db/queries/profiles-queries"

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  throw new Error("BASE_URL environment variable is not set")
}

// Schema for validating incoming question data
const questionSchema = z.object({
  data: z.object({
    question: z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string().optional()
      })
    })
  })
})

export async function POST(req: NextRequest) {
  try {
    console.log("=== New Question Request ===")
    console.log("Headers:", {
      authorization: req.headers.get("authorization")?.replace(/Bearer\s+(.{6}).*/, "Bearer $1..."),
      contentType: req.headers.get("content-type")
    })

    // Verify API key
    const apiKey = await verifyApiKey(req)
    if (!apiKey.isValid) {
      console.log("❌ Invalid API key")
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid or missing API key",
          code: "UNAUTHORIZED"
        }
      }, { status: 401 })
    }
    console.log("✓ API key verified")

    // Parse and validate request body
    const body = await req.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    
    const validatedData = questionSchema.safeParse(body)
    if (!validatedData.success) {
      console.log("❌ Invalid request data:", validatedData.error.format())
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid request data",
          code: "INVALID_REQUEST",
          details: validatedData.error.format()
        }
      }, { status: 400 })
    }
    console.log("✓ Request data validated")

    const {
      question: {
        id: externalQuestionId,
        title,
        body: questionBody,
        user: { id: externalUserId }
      }
    } = validatedData.data.data

    console.log("Extracted data:", {
      externalQuestionId,
      title,
      externalUserId
    })

    // Get the bot app name from the API key
    if (!apiKey.apiKey?.key) {
      console.log("❌ Missing API key in verified token")
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid API key",
          code: "INVALID_API_KEY"
        }
      }, { status: 400 })
    }

    const [apiKeyDetails] = await db
      .select({ name: apiKeysTable.name })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.key, apiKey.apiKey.key))

    if (!apiKeyDetails?.name) {
      console.log("❌ No name found for API key")
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid API key configuration",
          code: "INVALID_API_KEY"
        }
      }, { status: 400 })
    }
    console.log("✓ Bot app name found:", apiKeyDetails.name)

    // Find the mapped user in our system
    console.log("Looking up bot user:", {
      botAppName: apiKeyDetails.name,
      externalUserId
    })
    const botUser = await getBotUserByBotAppId(apiKeyDetails.name, externalUserId)
    if (!botUser) {
      console.log("❌ Bot user not found")
      return NextResponse.json({
        success: false,
        error: {
          message: "Bot user not found in the system",
          code: "BOT_USER_NOT_FOUND",
          details: {
            botAppName: apiKeyDetails.name,
            externalUserId
          }
        }
      }, { status: 404 })
    }
    console.log("✓ Bot user found:", {
      id: botUser.id,
      userId: botUser.userId,
      name: botUser.name,
      email: botUser.email
    })

    // Verify the user exists in profiles
    try {
      const profile = await getProfileById(botUser.userId)
      console.log("✓ Profile found:", {
        userId: profile.userId,
        email: profile.email
      })
    } catch (error) {
      console.log("❌ Profile not found for bot user")
      return NextResponse.json({
        success: false,
        error: {
          message: "Profile not found for bot user",
          code: "PROFILE_NOT_FOUND",
          details: {
            userId: botUser.userId,
            botAppName: apiKeyDetails.name,
            externalUserId
          }
        }
      }, { status: 404 })
    }

    // Create question in our system using the mapped user ID
    console.log("Creating question for user:", botUser.userId)
    const [question] = await db
      .insert(questionsTable)
      .values({
        userId: botUser.userId,
        title,
        body: questionBody,
        votes: 0
      })
      .returning()
    console.log("✓ Question created:", question.id)

    // Create mapping between our question and external question
    const [mapping] = await db
      .insert(questionMappingsTable)
      .values({
        questionId: question.id,
        externalQuestionId,
        externalUserId
      })
      .returning()
    console.log("✓ Question mapping created:", mapping.id)

    console.log("=== Request completed successfully ===")
    const response = {
      success: true,
      data: {
        question: {
          id: question.id,
          title: question.title,
          body: question.body,
          createdAt: question.createdAt,
          mapping: {
            id: mapping.id,
            externalId: mapping.externalQuestionId
          },
          url: `${BASE_URL}/qna/${question.id}`
        }
      }
    }
    
    console.log("Response payload:", JSON.stringify(response, null, 2))
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("=== Error creating question ===")
    console.error("Error details:", error)
    const errorResponse = {
      success: false,
      error: {
        message: "Failed to create question",
        code: "INTERNAL_ERROR"
      }
    }
    console.log("Error response payload:", JSON.stringify(errorResponse, null, 2))
    return NextResponse.json(errorResponse, { status: 500 })
  }
} 
