import { db } from "@/db/db"
import { answersTable, answerVotesTable, profilesTable } from "@/db/schema"
import { eq, desc, sql, and } from "drizzle-orm"

export type AnswerWithUser = {
  id: string
  questionId: string
  userId: string
  body: string
  accepted: boolean
  votes: number
  createdAt: Date
  updatedAt: Date
  user: {
    firstName: string
    lastName: string
  } | null
}

export async function getAnswers(questionId: string): Promise<AnswerWithUser[]> {
  const answers = await db
    .select()
    .from(answersTable)
    .leftJoin(profilesTable, eq(answersTable.userId, profilesTable.userId))
    .where(eq(answersTable.questionId, questionId))
    .orderBy(desc(answersTable.votes), desc(answersTable.createdAt))

  return answers.map(({ answers, profiles }) => ({
    ...answers,
    user: profiles ? {
      firstName: profiles.firstName,
      lastName: profiles.lastName
    } : null
  }))
}

export async function getAnswerById(id: string): Promise<AnswerWithUser | null> {
  const [result] = await db
    .select()
    .from(answersTable)
    .leftJoin(profilesTable, eq(answersTable.userId, profilesTable.userId))
    .where(eq(answersTable.id, id))

  if (!result) return null

  return {
    ...result.answers,
    user: result.profiles ? {
      firstName: result.profiles.firstName,
      lastName: result.profiles.lastName
    } : null
  }
}

export async function getAnswersByUserId(userId: string): Promise<AnswerWithUser[]> {
  const answers = await db
    .select()
    .from(answersTable)
    .leftJoin(profilesTable, eq(answersTable.userId, profilesTable.userId))
    .where(eq(answersTable.userId, userId))
    .orderBy(desc(answersTable.votes), desc(answersTable.createdAt))

  return answers.map(({ answers, profiles }) => ({
    ...answers,
    user: profiles ? {
      firstName: profiles.firstName,
      lastName: profiles.lastName
    } : null
  }))
}

export async function createAnswer(data: {
  questionId: string
  userId: string
  body: string
}): Promise<AnswerWithUser | null> {
  const [answer] = await db
    .insert(answersTable)
    .values(data)
    .returning()

  return getAnswerById(answer.id)
}

export async function updateAnswer(
  id: string,
  data: {
    body?: string
    accepted?: boolean
    votes?: number
  }
): Promise<AnswerWithUser | null> {
  const [answer] = await db
    .update(answersTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(answersTable.id, id))
    .returning()

  return getAnswerById(answer.id)
}

export async function deleteAnswer(id: string) {
  const [answer] = await db
    .delete(answersTable)
    .where(eq(answersTable.id, id))
    .returning()
  return answer
}

export async function voteAnswer(id: string, userId: string, value: 1 | -1): Promise<AnswerWithUser | null> {
  // Check if user has already voted
  const [existingVote] = await db
    .select()
    .from(answerVotesTable)
    .where(
      and(
        eq(answerVotesTable.answerId, id),
        eq(answerVotesTable.userId, userId)
      )
    )

  if (existingVote) {
    if (existingVote.value === value) {
      // Remove vote if clicking same button
      await db
        .delete(answerVotesTable)
        .where(
          and(
            eq(answerVotesTable.answerId, id),
            eq(answerVotesTable.userId, userId)
          )
        )

      // Update answer vote count
      const [answer] = await db
        .update(answersTable)
        .set({
          votes: sql`${answersTable.votes} - ${value}`,
          updatedAt: new Date()
        })
        .where(eq(answersTable.id, id))
        .returning()

      return getAnswerById(answer.id)
    } else {
      // Change vote if clicking different button
      await db
        .update(answerVotesTable)
        .set({ value })
        .where(
          and(
            eq(answerVotesTable.answerId, id),
            eq(answerVotesTable.userId, userId)
          )
        )

      // Update answer vote count (multiply by 2 because we're changing from -1 to 1 or vice versa)
      const [answer] = await db
        .update(answersTable)
        .set({
          votes: sql`${answersTable.votes} + ${value * 2}`,
          updatedAt: new Date()
        })
        .where(eq(answersTable.id, id))
        .returning()

      return getAnswerById(answer.id)
    }
  } else {
    // Add new vote
    await db
      .insert(answerVotesTable)
      .values({
        answerId: id,
        userId,
        value
      })

    // Update answer vote count
    const [answer] = await db
      .update(answersTable)
      .set({
        votes: sql`${answersTable.votes} + ${value}`,
        updatedAt: new Date()
      })
      .where(eq(answersTable.id, id))
      .returning()

    return getAnswerById(answer.id)
  }
}

export async function getUserVoteForAnswer(answerId: string, userId: string) {
  const [vote] = await db
    .select()
    .from(answerVotesTable)
    .where(
      and(
        eq(answerVotesTable.answerId, answerId),
        eq(answerVotesTable.userId, userId)
      )
    )
  return vote?.value || null
}

export async function acceptAnswer(id: string): Promise<AnswerWithUser | null> {
  const [answer] = await db
    .update(answersTable)
    .set({
      accepted: true,
      updatedAt: new Date()
    })
    .where(eq(answersTable.id, id))
    .returning()

  return getAnswerById(answer.id)
}

export async function unacceptAnswer(id: string): Promise<AnswerWithUser | null> {
  const [answer] = await db
    .update(answersTable)
    .set({
      accepted: false,
      updatedAt: new Date()
    })
    .where(eq(answersTable.id, id))
    .returning()

  return getAnswerById(answer.id)
} 