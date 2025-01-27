import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/db"
import { answerMappingsTable, answersTable, questionMappingsTable, apiKeysTable } from "@/db/schema"
import { verifyApiKey } from "@/lib/auth"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { getBotUserByBotAppId } from "@/db/queries/bot-users-queries"
import { getProfileById } from "@/db/queries/profiles-queries"

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

// Schema for validating incoming answer data
const answerSchema = z.object({
  data: z.object({
    answer: z.object({
      id: z.string(),
      body: z.string(),
      questionId: z.string(), // This is the external question ID
      user: z.object({
        id: z.string(),
        name: z.string()
      })
    })
  })
})

export async function POST(req: NextRequest) {
  try {
    console.log("=== New Answer Request ===")
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

    // Parse and validate request body
    const body = await req.json()
    console.log("Request body:", JSON.stringify(body, null, 2))
    
    const validatedData = answerSchema.safeParse(body)
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
      answer: {
        id: externalAnswerId,
        body: answerBody,
        questionId: externalQuestionId,
        user: { id: externalUserId, name: externalUserName }
      }
    } = validatedData.data.data

    console.log("Extracted data:", {
      externalAnswerId,
      externalQuestionId,
      externalUserId,
      externalUserName
    })

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

    // Find the internal question ID from the mapping
    console.log("Looking up question mapping for:", externalQuestionId)
    const [questionMapping] = await db
      .select()
      .from(questionMappingsTable)
      .where(eq(questionMappingsTable.externalQuestionId, externalQuestionId))

    if (!questionMapping) {
      console.log("❌ Question mapping not found")
      return NextResponse.json({
        success: false,
        error: {
          message: "Question not found",
          code: "NOT_FOUND",
          details: { externalQuestionId }
        }
      }, { status: 404 })
    }
    console.log("✓ Question mapping found:", questionMapping.id)

    // Create answer in our system
    console.log("Creating answer...")
    const [answer] = await db
      .insert(answersTable)
      .values({
        questionId: questionMapping.questionId,
        userId: botUser.userId, // Use the mapped user ID
        body: answerBody,
        votes: 0,
        accepted: false
      })
      .returning()
    console.log("✓ Answer created:", answer.id)

    // Create mapping between our answer and external answer
    const [mapping] = await db
      .insert(answerMappingsTable)
      .values({
        answerId: answer.id,
        externalAnswerId,
        externalUserId,
        externalUserName
      })
      .returning()
    console.log("✓ Answer mapping created:", mapping.id)

    const response = {
      success: true,
      data: {
        answer: {
          id: answer.id,
          body: answer.body,
          createdAt: answer.createdAt,
          mapping: {
            id: mapping.id,
            externalId: mapping.externalAnswerId
          },
          url: `${BASE_URL}/qna/${questionMapping.questionId}#answer-${answer.id}`
        }
      }
    }

    console.log("=== Request completed successfully ===")
    console.log("Response payload:", JSON.stringify(response, null, 2))
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("=== Error creating answer ===")
    console.error("Error details:", error)
    const errorResponse = {
      success: false,
      error: {
        message: "Failed to create answer",
        code: "INTERNAL_ERROR"
      }
    }
    console.log("Error response payload:", JSON.stringify(errorResponse, null, 2))
    return NextResponse.json(errorResponse, { status: 500 })
  }
} 