"use server"

import { ActionState } from "@/types"
import { SelectCategory } from "@/db/schema"
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "@/db/queries/categories-queries"

export async function getCategoriesAction(): Promise<ActionState<SelectCategory[]>> {
  try {
    const categories = await getCategories()
    return {
      isSuccess: true,
      message: "Categories retrieved successfully",
      data: categories
    }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { isSuccess: false, message: "Failed to get categories" }
  }
}

export async function getCategoryByIdAction(
  id: string
): Promise<ActionState<SelectCategory>> {
  try {
    const category = await getCategoryById(id)
    if (!category) {
      return { isSuccess: false, message: "Category not found" }
    }
    return {
      isSuccess: true,
      message: "Category retrieved successfully",
      data: category
    }
  } catch (error) {
    console.error("Error getting category:", error)
    return { isSuccess: false, message: "Failed to get category" }
  }
}

export async function createCategoryAction(
  name: string
): Promise<ActionState<SelectCategory>> {
  try {
    const category = await createCategory(name)
    return {
      isSuccess: true,
      message: "Category created successfully",
      data: category
    }
  } catch (error) {
    console.error("Error creating category:", error)
    return { isSuccess: false, message: "Failed to create category" }
  }
}

export async function updateCategoryAction(
  id: string,
  name: string
): Promise<ActionState<SelectCategory>> {
  try {
    const category = await updateCategory(id, name)
    return {
      isSuccess: true,
      message: "Category updated successfully",
      data: category
    }
  } catch (error) {
    console.error("Error updating category:", error)
    return { isSuccess: false, message: "Failed to update category" }
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionState<SelectCategory>> {
  try {
    const category = await deleteCategory(id)
    return {
      isSuccess: true,
      message: "Category deleted successfully",
      data: category
    }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { isSuccess: false, message: "Failed to delete category" }
  }
} 