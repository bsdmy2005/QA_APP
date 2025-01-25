"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createTagAction } from "@/actions/tags-actions"
import { toast } from "sonner"
import { Loader2, Tag as TagIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  name: string
  usageCount?: number
}

interface TagInputProps {
  availableTags: Tag[]
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  maxTags?: number
}

export function TagInput({ 
  availableTags, 
  selectedTags, 
  onTagsChange,
  maxTags = 5 
}: TagInputProps) {
  const [newTagInput, setNewTagInput] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  const handleSelect = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`)
      return
    }

    if (!selectedTags.some(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag])
      toast.success(`Added tag: ${tag.name}`)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagInput.trim()) return

    if (selectedTags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`)
      return
    }

    // Check if tag already exists
    const existingTag = availableTags.find(
      tag => tag.name.toLowerCase() === newTagInput.toLowerCase().trim()
    )

    if (existingTag) {
      handleSelect(existingTag)
      setNewTagInput("")
      return
    }

    try {
      setIsCreating(true)
      const result = await createTagAction(newTagInput.trim())
      
      if (result.isSuccess && result.data) {
        onTagsChange([...selectedTags, result.data])
        toast.success(`Created new tag: ${result.data.name}`)
        setNewTagInput("")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create tag")
    } finally {
      setIsCreating(false)
    }
  }

  const removeTag = (tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagToRemove.id))
    toast.success(`Removed tag: ${tagToRemove.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Selected Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <TagIcon className="w-3 h-3" />
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Available Tags
        </label>
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/50">
          {availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags available</p>
          ) : (
            availableTags.map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.some(t => t.id === tag.id) ? "secondary" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedTags.some(t => t.id === tag.id) 
                    ? "bg-secondary" 
                    : "hover:bg-secondary/50"
                )}
                onClick={() => handleSelect(tag)}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag.name}
                {tag.usageCount !== undefined && tag.usageCount > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({tag.usageCount})
                  </span>
                )}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* New Tag Creation */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Add New Tag
        </label>
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <Input
            placeholder="Type a new tag name..."
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            disabled={isCreating || selectedTags.length >= maxTags}
          />
          <button
            type="submit"
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            disabled={!newTagInput.trim() || isCreating || selectedTags.length >= maxTags}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 