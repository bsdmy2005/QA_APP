"use server"

import { getCategoriesAction } from "@/actions/categories-actions"
import { CategoryList } from "./_components/category-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function CategoriesPage() {
  const categoriesRes = await getCategoriesAction()
  const categories = categoriesRes.isSuccess ? categoriesRes.data : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link href="/admin/categories/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </Link>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
} 