"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagInput } from "@/components/tag-input"
import { createQuestionAction } from "@/actions/questions-actions"
import { getTagsAction } from "@/actions/tags-actions"
import { toast } from "sonner"

interface Tag {
  id: string
  name: string
}

export function CreateQuestionForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadTags() {
      const result = await getTagsAction()
      if (result.isSuccess) {
        setAvailableTags(result.data)
      }
    }
    loadTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const result = await createQuestionAction({
        title: title.trim(),
        body: body.trim(),
        tags: tags.map(tag => tag.name)
      })

      if (result.isSuccess) {
        toast.success("Question created successfully")
        router.push("/qna")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create question")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Question title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <RichTextEditor
          content={body}
          onChange={setBody}
          placeholder="Question details..."
        />
      </div>

      <div className="space-y-2">
        <TagInput
          availableTags={availableTags}
          selectedTags={tags}
          onTagsChange={setTags}
          maxTags={5}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Question"}
        </Button>
      </div>
    </form>
  )
} 