"use client"

import { handleCreateAnswer } from "../actions"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProcessedImage } from "@/lib/image-utils"
import { uploadImages } from "@/lib/supabase-storage"
import { toast } from "sonner"

interface AnswerFormProps {
  questionId: string
  userId: string
}

async function prepareFileForUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  return {
    name: file.name,
    type: file.type,
    arrayBuffer: new Uint8Array(arrayBuffer)
  }
}

export default function AnswerForm({ questionId, userId }: AnswerFormProps) {
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localImages, setLocalImages] = useState<ProcessedImage[]>([])
  const router = useRouter()

  // Add logging when images change
  const handleImagesChange = (images: ProcessedImage[]) => {
    console.log('Images changed:', images)
    setLocalImages(images)
  }

  // Add logging when content changes
  const handleContentChange = (newContent: string) => {
    console.log('Content changed:', newContent)
    setBody(newContent)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      let updatedBody = body
      console.log('=== Starting Answer Submission ===')
      console.log('Original body content:', body)
      console.log('Local images state:', localImages)

      // Upload local images to Supabase and replace URLs
      if (localImages.length > 0) {
        console.log('Processing local images...')
        
        const filesData = await Promise.all(
          localImages.map(async (image) => {
            console.log('Preparing file for upload:', image.file.name)
            const arrayBuffer = await image.file.arrayBuffer()
            return {
              name: image.file.name,
              type: image.file.type,
              arrayBuffer: new Uint8Array(arrayBuffer)
            }
          })
        )

        console.log('Uploading files to Supabase...')
        const uploadedUrls = await uploadImages(filesData)
        console.log('Received Supabase URLs:', uploadedUrls)

        // Create a temporary DOM element to parse and modify the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = updatedBody

        // Replace each blob URL with its corresponding Supabase URL
        localImages.forEach((image, index) => {
          console.log('\nProcessing image replacement:', {
            id: image.id,
            name: image.file.name,
            thumbnailUrl: image.thumbnailUrl,
            newUrl: uploadedUrls[index]
          })

          // Try finding images with data-local-id first
          const imgElements = tempDiv.querySelectorAll(`img[data-local-id="${image.id}"]`)
          console.log(`Found ${imgElements.length} images with data-local-id=${image.id}`)

          if (imgElements.length > 0) {
            imgElements.forEach(img => {
              console.log('Replacing src for image with data-local-id:', {
                oldSrc: img.getAttribute('src'),
                newSrc: uploadedUrls[index]
              })
              img.setAttribute('src', uploadedUrls[index])
            })
          } else {
            // Fallback: try finding images by src attribute
            console.log('No images found with data-local-id, trying src attribute...')
            const imgsByUrl = tempDiv.querySelectorAll('img')
            let replaced = false

            imgsByUrl.forEach(img => {
              const src = img.getAttribute('src')
              if (src === image.thumbnailUrl) {
                console.log('Found matching image by src:', {
                  oldSrc: src,
                  newSrc: uploadedUrls[index]
                })
                img.setAttribute('src', uploadedUrls[index])
                replaced = true
              }
            })

            if (!replaced) {
              console.warn('Could not find image to replace:', {
                id: image.id,
                thumbnailUrl: image.thumbnailUrl
              })
            }
          }
        })

        // Get the updated HTML content
        updatedBody = tempDiv.innerHTML
        console.log('\nFinal body content:', updatedBody)
        console.log('=== URL Replacement Complete ===')
      }

      console.log('Submitting form with final content:', updatedBody)
      const formData = new FormData()
      formData.append("body", updatedBody)
      await handleCreateAnswer(questionId, userId, formData)
      setBody("")
      setLocalImages([])
      router.refresh()
    } catch (error) {
      console.error("Error creating answer:", error)
      toast.error("Failed to create answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RichTextEditor
        content={body}
        onChange={handleContentChange}
        placeholder="Write your answer here..."
        minHeight="200px"
        onImagesChange={handleImagesChange}
        disabled={isSubmitting}
      />

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Your Answer"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Please be sure to answer the question. Provide details and share your research.
        </p>
      </div>
    </form>
  )
} 