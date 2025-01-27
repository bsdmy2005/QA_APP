import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  answersTable,
  answerVotesTable,
  categoriesTable,
  commentsTable,
  profilesTable,
  questionsTable,
  questionVotesTable,
  tagsTable,
  questionTagsTable,
  botUsersTable,
  botQuestionsTable,
  botAnswersTable,
  apiKeysTable
} from "@/db/schema";

const connectionString = process.env.DATABASE_URL!;

// Initialize the client
const client = postgres(connectionString);

const schema = {
  answers: answersTable,
  answerVotes: answerVotesTable,
  categories: categoriesTable,
  comments: commentsTable,
  profiles: profilesTable,
  questions: questionsTable,
  questionVotes: questionVotesTable,
  tags: tagsTable,
  questionTags: questionTagsTable,
  botUsers: botUsersTable,
  botQuestions: botQuestionsTable,
  botAnswers: botAnswersTable,
  apiKeys: apiKeysTable
};

// Initialize the database with relations
export const db = drizzle(client, { schema });