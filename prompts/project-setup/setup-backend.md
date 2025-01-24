# Backend Setup Instructions

Use this guide to setup the backend for this project.

It uses Supabase, Drizzle ORM, and Server Actions.

Write the complete code for every step. Do not get lazy. Write everything that is needed.

Your goal is to completely finish the backend setup.

i work on windows make sure to use powershell commands.


## Helpful Links

If the user gets stuck, refer them to the following links:

- [Supabase](https://supabase.com/)
- [Drizzle Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle with Supabase Quickstart](https://orm.drizzle.team/learn/tutorials/drizzle-with-supabase)

## Required Environment Variables

Make sure the user knows to set the following environment variables:

```bash
DATABASE_URL=
```

## Install Libraries

Make sure the user knows to install the following libraries:

```bash
npm i drizzle-orm dotenv postgres
npm i -D drizzle-kit
```

## Setup Steps

- Create a `/db` folder in the root of the project

- Create a `/types` folder in the root of the project

- Add a `drizzle.config.ts` file to the root of the project with the following code:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
```

- Add a file called `db.ts` to the `/db` folder with the following code:

```ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { exampleTable, profilesTable } from "./schema";

config({ path: ".env.local" });

const schema = {
  exampleTable,
  profilesTable
};

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
```

- Create 2 folders in the `/db` folder:

- `/schema`
  - Add a file called `index.ts` to the `/schema` folder
- `/queries`

- Create a profiles schema in the `/schema` folder called `profiles-schema.ts` with the following code:

```ts
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const membershipEnum = pgEnum("membership", ["free", "premium", "enterprise"]);

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").default("user").notNull(),
  membership: membershipEnum("membership").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type InsertProfile = typeof profilesTable.$inferInsert;
export type SelectProfile = typeof profilesTable.$inferSelect;
```
- Create a new file called `profiles-queries.ts` in the `/queries` folder with the following code:

```ts
"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { InsertProfile, SelectProfile, profilesTable } from "../schema/profiles-schema";

export const createProfile = async (data: InsertProfile): Promise<SelectProfile> => {
  try {
    const [newProfile] = await db.insert(profilesTable).values(data).returning();
    return newProfile as SelectProfile;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw new Error("Failed to create profile");
  }
};

export const getProfileById = async (userId: string): Promise<SelectProfile> => {
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.userId, userId)
    });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile as SelectProfile;
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    throw new Error("Failed to get profile");
  }
};

export const getAllProfiles = async (): Promise<SelectProfile[]> => {
  const profiles = await db.query.profilesTable.findMany();
  return profiles as SelectProfile[];
};

export const updateProfile = async (userId: string, data: Partial<InsertProfile>): Promise<SelectProfile> => {
  try {
    const [updatedProfile] = await db.update(profilesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profilesTable.userId, userId))
      .returning();
    return updatedProfile as SelectProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
};

export const deleteProfile = async (userId: string): Promise<void> => {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.userId, userId));
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw new Error("Failed to delete profile");
  }
};
```

- Create a file called `action-types.ts` in the `/types/actions` folder for server action types with the following code:

```ts
export type ActionResult<T> = {
  isSuccess: boolean;
  message: string;
  data?: T;
};
```

- Create file called `/types/index.ts` and export all the types from the `/types` folder like so:

```ts
export * from "./action-types";
```

- Create a file called `profiles-actions.ts` in the `/actions` folder for the profiles table's actions:

```ts
"use server";

import { createProfile, deleteProfile, getAllProfiles, getProfileById, updateProfile } from "@/db/queries/profiles-queries";
import { InsertProfile, SelectProfile } from "@/db/schema/profiles-schema";
import { ActionResult } from "@/types/actions/action-types";
import { revalidatePath } from "next/cache";

export async function createProfileAction(data: InsertProfile): Promise<ActionResult<SelectProfile>> {
  try {
    const newProfile = await createProfile(data);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile created successfully", data: newProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to create profile" };
  }
}

export async function getProfileByIdAction(userId: string): Promise<ActionResult<SelectProfile>> {
  try {
    const profile = await getProfileById(userId);
    return { isSuccess: true, message: "Profile retrieved successfully", data: profile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get profile" };
  }
}

export async function getAllProfilesAction(): Promise<ActionResult<SelectProfile[]>> {
  try {
    const profiles = await getAllProfiles();
    return { isSuccess: true, message: "Profiles retrieved successfully", data: profiles };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get profiles" };
  }
}

export async function updateProfileAction(userId: string, data: Partial<InsertProfile>): Promise<ActionResult<SelectProfile>> {
  try {
    const updatedProfile = await updateProfile(userId, data);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile updated successfully", data: updatedProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update profile" };
  }
}

export async function deleteProfileAction(userId: string): Promise<ActionResult<void>> {
  try {
    await deleteProfile(userId);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile deleted successfully" };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete profile" };
  }
}
```

- In `package.json`, add the following scripts:

```json
"scripts": {
  "db:generate": "npx drizzle-kit generate",
  "db:migrate": "npx drizzle-kit migrate"
}
```

- Run the following command to generate the tables:

```bash
npm run db:generate
```

- Run the following command to migrate the tables:

```bash
npm run db:migrate
```

- The backend is now setup.
