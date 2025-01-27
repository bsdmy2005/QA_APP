import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/db"
import { 
  answerMappingsTable, 
  answersTable, 
  apiKeysTable,
  botUsersTable,
  profilesTable
} from "@/db/schema"
import { verifyApiKey } from "@/lib/auth"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { getBotUserByBotAppId } from "@/db/queries/bot-users-queries"
import { getProfileById } from "@/db/queries/profiles-queries"

// Schema for validating accept answer request
const acceptAnswerSchema = z.object({
  data: z.object({
    answer: z.object({
      id: z.string(),
      accept: z.boolean(),
      user: z.object({
        id: z.string(),
        name: z.string()
      })
    })
  })
})

export async function POST(req: NextRequest) {
  try {
    console.log("\n=== Accept Answer Request ===")
    console.log("Request URL:", req.url)
    console.log("Request Method:", req.method)
    console.log("Headers:", {
      authorization: req.headers.get("authorization")?.replace(/Bearer\s+(.{6}).*/, "Bearer $1..."),
      contentType: req.headers.get("content-type"),
      host: req.headers.get("host"),
      origin: req.headers.get("origin")
    })

    // Log raw request body for debugging
    const rawBody = await req.text()
    console.log("\nRaw Request Body:", rawBody)
    
    let body
    try {
      body = JSON.parse(rawBody)
      console.log("\nParsed Request Body:", JSON.stringify(body, null, 2))
    } catch (error) {
      console.log("❌ Failed to parse request body as JSON")
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid JSON in request body",
          code: "INVALID_REQUEST"
        }
      }, { status: 400 })
    }

    // Verify API key and get bot app name
    console.log("\n--- API Key Verification ---")
    const apiKeyResult = await verifyApiKey(req)
    console.log("API Key Result:", {
      isValid: apiKeyResult.isValid,
      hasKey: !!apiKeyResult.apiKey
    })

    if (!apiKeyResult.isValid || !apiKeyResult.apiKey) {
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

    // Get API key record
    console.log("\n--- API Key Details ---")
    const [apiKeyRecord] = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.key, apiKeyResult.apiKey.key))

    console.log("API Key Record Found:", !!apiKeyRecord)
    console.log("Has Bot App Name:", !!apiKeyRecord?.name)

    if (!apiKeyRecord?.name) {
      console.log("❌ Bot app name not found for API key")
      return NextResponse.json({
        success: false,
        error: {
          message: "Invalid API key configuration",
          code: "INVALID_API_KEY"
        }
      }, { status: 401 })
    }
    
    // Validate request body
    console.log("\n--- Request Validation ---")
    const validatedData = acceptAnswerSchema.safeParse(body)
    if (!validatedData.success) {
      console.log("❌ Invalid request data")
      console.log("Validation Errors:", validatedData.error.format())
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
        id: answerId,
        accept,
        user: { id: externalUserId, name: userName }
      }
    } = validatedData.data.data

    console.log("\nExtracted Data:", {
      answerId,
      accept,
      externalUserId,
      userName
    })

    // Get the bot user mapping
    console.log("\n--- Bot User Mapping ---")
    console.log("Looking up bot user:", {
      botAppName: apiKeyRecord.name,
      externalUserId
    })

    const botUser = await getBotUserByBotAppId(apiKeyRecord.name, externalUserId)
    if (!botUser) {
      console.log("❌ Bot user not found")
      return NextResponse.json({
        success: false,
        error: {
          message: "Bot user not found in the system",
          code: "BOT_USER_NOT_FOUND",
          details: {
            botAppName: apiKeyRecord.name,
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
    console.log("\n--- Profile Verification ---")
    try {
      const profile = await getProfileById(botUser.userId)
      console.log("✓ Profile found:", {
        userId: profile.userId,
        email: profile.email
      })

      // Find the answer mapping
      console.log("\n--- Answer Mapping ---")
      console.log("Looking up answer mapping for external ID:", answerId)
      const [answerMapping] = await db
        .select()
        .from(answerMappingsTable)
        .where(eq(answerMappingsTable.externalAnswerId, answerId))

      console.log("Answer Mapping Found:", !!answerMapping)
      if (answerMapping) {
        console.log("Answer Mapping Details:", {
          id: answerMapping.id,
          answerId: answerMapping.answerId,
          externalAnswerId: answerMapping.externalAnswerId,
          externalUserId: answerMapping.externalUserId,
          externalUserName: answerMapping.externalUserName
        })
      } else {
        // Let's check what mappings exist
        const allMappings = await db
          .select({
            externalAnswerId: answerMappingsTable.externalAnswerId,
            answerId: answerMappingsTable.answerId
          })
          .from(answerMappingsTable)
          .limit(5)
        console.log("Sample of existing mappings:", allMappings)
      }

      if (!answerMapping) {
        console.log("❌ Answer mapping not found")
        return NextResponse.json({
          success: false,
          error: {
            message: "Answer not found",
            code: "NOT_FOUND"
          }
        }, { status: 404 })
      }
      console.log("✓ Answer mapping found:", answerMapping.id)

      // Update the answer to mark it as accepted
      console.log("\n--- Updating Answer ---")
      console.log("Update Data:", {
        accepted: accept,
        userId: profile.userId,
        answerId: answerMapping.answerId
      })

      const [updatedAnswer] = await db
        .update(answersTable)
        .set({ 
          accepted: accept,
          userId: profile.userId, // Store who accepted the answer
          updatedAt: new Date()
        })
        .where(eq(answersTable.id, answerMapping.answerId))
        .returning()

      console.log("Answer Updated:", !!updatedAnswer)
      if (updatedAnswer) {
        console.log("Updated Answer Details:", {
          id: updatedAnswer.id,
          accepted: updatedAnswer.accepted,
          userId: updatedAnswer.userId,
          questionId: updatedAnswer.questionId
        })
      }

      console.log("✓ Answer accepted status updated:", updatedAnswer.id)

      const response = {
        success: true,
        data: {
          answer: {
            id: updatedAnswer.id,
            accepted: updatedAnswer.accepted,
            acceptedBy: {
              id: externalUserId,
              name: userName
            },
            url: `${process.env.BASE_URL}/qna/${updatedAnswer.questionId}#answer-${updatedAnswer.id}`
          }
        }
      }

      console.log("\n=== Request completed successfully ===")
      console.log("Response payload:", JSON.stringify(response, null, 2))
      return NextResponse.json(response)
    } catch (error) {
      console.log("❌ Profile not found for bot user")
      return NextResponse.json({
        success: false,
        error: {
          message: "Profile not found for bot user",
          code: "PROFILE_NOT_FOUND",
          details: {
            userId: botUser.userId,
            botAppName: apiKeyRecord.name,
            externalUserId
          }
        }
      }, { status: 404 })
    }
  } catch (error) {
    console.error("\n=== Error accepting answer ===")
    console.error("Error details:", error)
    const errorResponse = {
      success: false,
      error: {
        message: "Failed to accept answer",
        code: "INTERNAL_ERROR"
      }
    }
    console.log("Error response payload:", JSON.stringify(errorResponse, null, 2))
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Also handle PATCH method since that's what's being used
export { POST as PATCH } 