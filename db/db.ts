import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { profilesTable } from "@/db/schema";
import {
  categoriesTable,
  questionsTable,
  answersTable,
  commentsTable,
  tagsTable,
  questionTagsTable,
  questionsRelations,
  answersRelations,
  tagsRelations,
  questionTagsRelations
} from "@/db/schema";

const connectionString = process.env.DATABASE_URL!;

// Initialize the client
export const client = postgres(connectionString);

// Initialize the database with relations
export const db = drizzle(client, {
  schema: {
    profiles: profilesTable,
    categories: categoriesTable,
    questions: {
      ...questionsTable,
      ...questionsRelations
    },
    answers: {
      ...answersTable,
      ...answersRelations
    },
    comments: commentsTable,
    tags: {
      ...tagsTable,
      ...tagsRelations
    },
    questionTags: {
      ...questionTagsTable,
      ...questionTagsRelations
    }
  },
  logger: true
});