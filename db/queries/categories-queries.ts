import { db } from "@/db/db"
import { categoriesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getCategories() {
  return await db.query.categories.findMany()
}

export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, id))
  return category
}

export async function createCategory(name: string) {
  const [category] = await db
    .insert(categoriesTable)
    .values({ name })
    .returning()
  return category
}

export async function updateCategory(id: string, name: string) {
  const [category] = await db
    .update(categoriesTable)
    .set({ name })
    .where(eq(categoriesTable.id, id))
    .returning()
  return category
}

export async function deleteCategory(id: string) {
  const [category] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .returning()
  return category
} 