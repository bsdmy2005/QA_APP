import { db } from "@/db/db"
import { questionsTable, answersTable, categoriesTable, tagsTable, questionTagsTable, questionVotesTable, profilesTable } from "@/db/schema"
import { eq, desc, sql, and } from "drizzle-orm"

export async function getQuestions() {
  const questions = await db
    .select({
      question: questionsTable,
      category: categoriesTable,
      answerCount: sql<number>`count(distinct ${answersTable.id})::int`,
      tags: sql<{ id: string; name: string }[]>`
        json_agg(
          json_build_object(
            'id', ${tagsTable.id},
            'name', ${tagsTable.name}
          )
        ) filter (where ${tagsTable.id} is not null)
      `,
      user: {
        firstName: profilesTable.firstName,
        lastName: profilesTable.lastName
      }
    })
    .from(questionsTable)
    .leftJoin(categoriesTable, eq(questionsTable.categoryId, categoriesTable.id))
    .leftJoin(answersTable, eq(questionsTable.id, answersTable.questionId))
    .leftJoin(questionTagsTable, eq(questionsTable.id, questionTagsTable.questionId))
    .leftJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
    .leftJoin(profilesTable, eq(questionsTable.userId, profilesTable.userId))
    .groupBy(questionsTable.id, categoriesTable.id, profilesTable.userId, profilesTable.firstName, profilesTable.lastName)
    .orderBy(desc(questionsTable.createdAt))

  return questions.map(q => ({
    ...q.question,
    category: q.category,
    answerCount: q.answerCount || 0,
    tags: q.tags || [],
    user: q.user
  }))
}

export async function getQuestionById(id: string) {
  const [result] = await db
    .select({
      question: questionsTable,
      category: categoriesTable,
      answerCount: sql<number>`count(distinct ${answersTable.id})::int`,
      tags: sql<{ id: string; name: string }[]>`
        json_agg(
          json_build_object(
            'id', ${tagsTable.id},
            'name', ${tagsTable.name}
          )
        ) filter (where ${tagsTable.id} is not null)
      `,
      user: {
        firstName: profilesTable.firstName,
        lastName: profilesTable.lastName
      }
    })
    .from(questionsTable)
    .leftJoin(categoriesTable, eq(questionsTable.categoryId, categoriesTable.id))
    .leftJoin(answersTable, eq(questionsTable.id, answersTable.questionId))
    .leftJoin(questionTagsTable, eq(questionsTable.id, questionTagsTable.questionId))
    .leftJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
    .leftJoin(profilesTable, eq(questionsTable.userId, profilesTable.userId))
    .where(eq(questionsTable.id, id))
    .groupBy(questionsTable.id, categoriesTable.id, profilesTable.userId, profilesTable.firstName, profilesTable.lastName)

  if (!result) return null

  return {
    ...result.question,
    category: result.category,
    answerCount: result.answerCount || 0,
    tags: result.tags || [],
    user: result.user
  }
}

export async function getQuestionsByUserId(userId: string) {
  const questions = await db
    .select({
      question: questionsTable,
      category: categoriesTable,
      answerCount: sql<number>`count(distinct ${answersTable.id})::int`,
      tags: sql<{ id: string; name: string }[]>`
        json_agg(
          json_build_object(
            'id', ${tagsTable.id},
            'name', ${tagsTable.name}
          )
        ) filter (where ${tagsTable.id} is not null)
      `,
      user: {
        firstName: profilesTable.firstName,
        lastName: profilesTable.lastName
      }
    })
    .from(questionsTable)
    .leftJoin(categoriesTable, eq(questionsTable.categoryId, categoriesTable.id))
    .leftJoin(answersTable, eq(questionsTable.id, answersTable.questionId))
    .leftJoin(questionTagsTable, eq(questionsTable.id, questionTagsTable.questionId))
    .leftJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
    .leftJoin(profilesTable, eq(questionsTable.userId, profilesTable.userId))
    .where(eq(questionsTable.userId, userId))
    .groupBy(questionsTable.id, categoriesTable.id, profilesTable.userId, profilesTable.firstName, profilesTable.lastName)
    .orderBy(desc(questionsTable.createdAt))

  return questions.map(q => ({
    ...q.question,
    category: q.category,
    answerCount: q.answerCount || 0,
    tags: q.tags || [],
    user: q.user
  }))
}

export async function getQuestionsByTag(tagId: string) {
  const questions = await db
    .select({
      question: questionsTable,
      category: categoriesTable,
      answerCount: sql<number>`count(distinct ${answersTable.id})::int`,
      tags: sql<{ id: string; name: string }[]>`
        json_agg(
          json_build_object(
            'id', ${tagsTable.id},
            'name', ${tagsTable.name}
          )
        ) filter (where ${tagsTable.id} is not null)
      `,
      user: {
        firstName: profilesTable.firstName,
        lastName: profilesTable.lastName
      }
    })
    .from(questionsTable)
    .innerJoin(questionTagsTable, eq(questionsTable.id, questionTagsTable.questionId))
    .innerJoin(tagsTable, eq(questionTagsTable.tagId, tagsTable.id))
    .leftJoin(categoriesTable, eq(questionsTable.categoryId, categoriesTable.id))
    .leftJoin(answersTable, eq(questionsTable.id, answersTable.questionId))
    .leftJoin(profilesTable, eq(questionsTable.userId, profilesTable.userId))
    .where(eq(tagsTable.id, tagId))
    .groupBy(questionsTable.id, categoriesTable.id, profilesTable.userId, profilesTable.firstName, profilesTable.lastName)
    .orderBy(desc(questionsTable.createdAt))

  return questions.map(q => ({
    ...q.question,
    category: q.category,
    answerCount: q.answerCount || 0,
    tags: q.tags || [],
    user: q.user
  }))
}

export async function createQuestion(data: {
  userId: string
  categoryId?: string
  title: string
  body: string
  tags?: string[]
  images?: string
}) {
  const [question] = await db
    .insert(questionsTable)
    .values({
      userId: data.userId,
      categoryId: data.categoryId,
      title: data.title,
      body: data.body,
      images: data.images
    })
    .returning()

  if (data.tags && data.tags.length > 0) {
    // Create new tags if they don't exist and link them
    for (const tagName of data.tags) {
      const normalizedName = tagName.toLowerCase().trim()
      
      // Find or create tag
      const [existingTag] = await db
        .select()
        .from(tagsTable)
        .where(sql`LOWER(${tagsTable.name}) = ${normalizedName}`)
        .limit(1)

      const tagId = existingTag?.id || (await db
        .insert(tagsTable)
        .values({ 
          name: normalizedName,
          usageCount: 1
        })
        .returning())[0].id

      // Link tag to question
      await db
        .insert(questionTagsTable)
        .values({ questionId: question.id, tagId })
        .onConflictDoNothing()

      // Increment usage count if tag existed
      if (existingTag) {
        await db
          .update(tagsTable)
          .set({ 
            usageCount: sql`${tagsTable.usageCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(tagsTable.id, tagId))
      }
    }
  }

  return getQuestionById(question.id)
}

export async function updateQuestion(
  id: string,
  data: {
    categoryId?: string
    title?: string
    body?: string
    tags?: string[]
    images?: string
  }
) {
  const [question] = await db
    .update(questionsTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(questionsTable.id, id))
    .returning()

  if (data.tags) {
    // Remove existing tags
    await db
      .delete(questionTagsTable)
      .where(eq(questionTagsTable.questionId, id))

    // Add new tags
    for (const tagName of data.tags) {
      const normalizedName = tagName.toLowerCase().trim()
      
      // Find or create tag
      const [existingTag] = await db
        .select()
        .from(tagsTable)
        .where(sql`LOWER(${tagsTable.name}) = ${normalizedName}`)
        .limit(1)

      const tagId = existingTag?.id || (await db
        .insert(tagsTable)
        .values({ 
          name: normalizedName,
          usageCount: 1
        })
        .returning())[0].id

      // Link tag to question
      await db
        .insert(questionTagsTable)
        .values({ questionId: id, tagId })
        .onConflictDoNothing()

      // Increment usage count if tag existed
      if (existingTag) {
        await db
          .update(tagsTable)
          .set({ 
            usageCount: sql`${tagsTable.usageCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(tagsTable.id, tagId))
      }
    }
  }

  return getQuestionById(id)
}

export async function deleteQuestion(id: string) {
  const [question] = await db
    .delete(questionsTable)
    .where(eq(questionsTable.id, id))
    .returning()
  return question
}

export async function voteQuestion(id: string, userId: string, value: 1 | -1) {
  // Check if user has already voted
  const [existingVote] = await db
    .select()
    .from(questionVotesTable)
    .where(
      and(
        eq(questionVotesTable.questionId, id),
        eq(questionVotesTable.userId, userId)
      )
    )

  if (existingVote) {
    if (existingVote.value === value) {
      // Remove vote if clicking same button
      await db
        .delete(questionVotesTable)
        .where(
          and(
            eq(questionVotesTable.questionId, id),
            eq(questionVotesTable.userId, userId)
          )
        )

      // Update question vote count
      const [question] = await db
        .update(questionsTable)
        .set({
          votes: sql`${questionsTable.votes} - ${value}`,
          updatedAt: new Date()
        })
        .where(eq(questionsTable.id, id))
        .returning()

      return question
    } else {
      // Change vote if clicking different button
      await db
        .update(questionVotesTable)
        .set({ value })
        .where(
          and(
            eq(questionVotesTable.questionId, id),
            eq(questionVotesTable.userId, userId)
          )
        )

      // Update question vote count (multiply by 2 because we're changing from -1 to 1 or vice versa)
      const [question] = await db
        .update(questionsTable)
        .set({
          votes: sql`${questionsTable.votes} + ${value * 2}`,
          updatedAt: new Date()
        })
        .where(eq(questionsTable.id, id))
        .returning()

      return question
    }
  } else {
    // Add new vote
    await db
      .insert(questionVotesTable)
      .values({
        questionId: id,
        userId,
        value
      })

    // Update question vote count
    const [question] = await db
      .update(questionsTable)
      .set({
        votes: sql`${questionsTable.votes} + ${value}`,
        updatedAt: new Date()
      })
      .where(eq(questionsTable.id, id))
      .returning()

    return question
  }
}

export async function getUserVoteForQuestion(questionId: string, userId: string) {
  const [vote] = await db
    .select()
    .from(questionVotesTable)
    .where(
      and(
        eq(questionVotesTable.questionId, questionId),
        eq(questionVotesTable.userId, userId)
      )
    )
  return vote?.value || null
} 