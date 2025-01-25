"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getQuestionsAction } from "@/actions/questions-actions"
import { getCategoriesAction } from "@/actions/categories-actions"
import { getTagsAction } from "@/actions/tags-actions"
import QuestionList from "./_components/question-list"
import CategoryList from "./_components/category-list"
import TagList from "./_components/tag-list"

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  // For simplicity, assume isAdmin check is done in layout or middleware
  const [questionsRes, categoriesRes, tagsRes] = await Promise.all([
    getQuestionsAction(),
    getCategoriesAction(),
    getTagsAction()
  ])

  const questions = questionsRes.isSuccess && questionsRes.data ? questionsRes.data : []
  const categories = categoriesRes.isSuccess && categoriesRes.data ? categoriesRes.data : []
  const tags = tagsRes.isSuccess && tagsRes.data ? tagsRes.data : []

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryList categories={categories} />
        <TagList tags={tags} />
      </div>

      <QuestionList questions={questions} />
    </div>
  )
}