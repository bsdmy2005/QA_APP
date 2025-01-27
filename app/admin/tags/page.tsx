"use server"

import { getTagsAction } from "@/actions/tags-actions"
import { TagList } from "./_components/tag-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function TagsPage() {
  const tagsRes = await getTagsAction()
  const tags = tagsRes.isSuccess ? tagsRes.data : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Tags</h1>
        <Link href="/admin/tags/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Tag
          </Button>
        </Link>
      </div>

      <TagList tags={tags} />
    </div>
  )
} 