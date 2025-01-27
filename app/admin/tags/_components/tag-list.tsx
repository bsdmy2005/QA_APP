"use client"

import { useState } from "react"
import { SelectTag } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  createTagAction,
  updateTagAction,
  deleteTagAction
} from "@/actions/tags-actions"

interface TagListProps {
  tags: SelectTag[]
}

export function TagList({ tags }: TagListProps) {
  const [newTagName, setNewTagName] = useState("")
  const [editingTag, setEditingTag] = useState<{
    id: string
    name: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleCreate() {
    if (newTagName.trim()) {
      const res = await createTagAction(newTagName)
      if (res.isSuccess) {
        toast({
          title: "Success",
          description: res.message
        })
        setNewTagName("")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive"
        })
      }
    }
  }

  async function handleUpdate(id: string, name: string) {
    if (name.trim()) {
      const res = await updateTagAction(id, name)
      if (res.isSuccess) {
        toast({
          title: "Success",
          description: res.message
        })
        setEditingTag(null)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive"
        })
      }
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteTagAction(id)
    if (res.isSuccess) {
      toast({
        title: "Success",
        description: res.message
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: res.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tags found
        </div>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="border rounded p-2 flex justify-between items-center"
            >
              {editingTag?.id === tag.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({
                        ...editingTag,
                        name: e.target.value
                      })
                    }
                  />
                  <Button
                    onClick={() => handleUpdate(tag.id, editingTag.name)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTag(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        setEditingTag({
                          id: tag.id,
                          name: tag.name
                        })
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 