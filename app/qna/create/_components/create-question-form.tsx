"use client"

import { handleCreateQuestion } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagInput } from "@/components/tag-input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getTagsAction } from "@/actions/tags-actions"
import { uploadImages } from "@/lib/supabase-storage"
import { toast } from "sonner"
import { ProcessedImage } from "@/lib/image-utils"

interface CreateQuestionFormProps {
  userId: string
}

interface Tag {
  id: string
  name: string
}

async function prepareFileForUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  return {
    name: file.name,
    type: file.type,
    arrayBuffer: new Uint8Array(arrayBuffer)
  }
}

export default function CreateQuestionForm({ userId }: CreateQuestionFormProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localImages, setLocalImages] = useState<ProcessedImage[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadTags = async () => {
      const result = await getTagsAction()
      if (result.isSuccess) {
        setAvailableTags(result.data)
      }
    }
    loadTags()
  }, [])

  const handleImageUpload = async (files: File[]) => {
    try {
      const filesData = await Promise.all(
        files.map(prepareFileForUpload)
      )

      const uploadPromise = uploadImages(filesData)
      
      toast.promise(uploadPromise, {
        loading: 'Uploading images...',
        success: (urls) => {
          if (urls.length === 0) {
            throw new Error('No images were uploaded')
          }
          return `Successfully uploaded ${urls.length} image${urls.length > 1 ? 's' : ''}`
        },
        error: 'Failed to upload images'
      })

      return await uploadPromise
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images")
      return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!body.trim()) {
      toast.error("Please enter a description")
      return
    }

    setIsSubmitting(true)
    try {
      let updatedBody = body

      // First, upload all local images to Supabase
      if (localImages.length > 0) {
        console.log('Local images to process:', localImages)
        console.log('Original body content:', body)

        const filesData = await Promise.all(
          localImages.map(async (image) => {
            const arrayBuffer = await image.file.arrayBuffer()
            return {
              name: image.file.name,
              type: image.file.type,
              arrayBuffer: new Uint8Array(arrayBuffer)
            }
          })
        )

        const uploadedUrls = await uploadImages(filesData)
        console.log('Uploaded URLs from Supabase:', uploadedUrls)

        // Replace each blob URL with its corresponding Supabase URL
        localImages.forEach((image, index) => {
          console.log('Processing image:', {
            id: image.id,
            thumbnailUrl: image.thumbnailUrl,
            newUrl: uploadedUrls[index]
          })

          // Look for both the blob URL and data URL patterns
          const blobUrlPattern = `src="blob:[^"]*${image.id}[^"]*"`
          const dataUrlPattern = `src="data:[^"]*"`
          
          // Create a regex that matches either pattern
          const urlRegex = new RegExp(`${blobUrlPattern}|${dataUrlPattern}`, 'g')
          
          // Replace the URL and log the change
          const beforeReplace = updatedBody
          updatedBody = updatedBody.replace(urlRegex, `src="${uploadedUrls[index]}"`)
          
          if (beforeReplace === updatedBody) {
            console.warn('No URL replacement occurred for image:', image.id)
            // Try a simpler replacement as fallback
            updatedBody = updatedBody.replace(
              new RegExp(image.thumbnailUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              uploadedUrls[index]
            )
          }
        })

        console.log('Final body content:', updatedBody)
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("body", updatedBody)
      formData.append("tags", JSON.stringify(tags))
      
      await handleCreateQuestion(userId, formData)
      router.push("/qna")
    } catch (error) {
      console.error("Error creating question:", error)
      toast.error("Failed to create question")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Ask a Question</h1>
        <p className="text-muted-foreground">
          Be specific and imagine you're asking a question to another person.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I implement authentication in Next.js?"
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground">
            Be specific and imagine you're asking a question to another person.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="text-sm font-medium">
            Body
          </label>
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Explain your question in detail..."
            minHeight="500px"
            onImagesChange={setLocalImages}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Include all the information someone would need to answer your question. You can paste images directly or use the image upload button.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tags
          </label>
          <TagInput
            availableTags={availableTags}
            selectedTags={tags}
            onTagsChange={setTags}
          />
          <p className="text-xs text-muted-foreground">
            Add up to 5 tags to describe what your question is about. Choose existing tags when possible.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/qna")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post your question"}
          </Button>
        </div>
      </form>
    </div>
  )
} 