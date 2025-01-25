"use client"

import { useState } from "react"
import { SelectTag } from "@/db/schema"
import { handleCreateTag, handleUpdateTag, handleDeleteTag } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash, Plus } from "lucide-react"

interface TagListProps {
  tags: SelectTag[]
}

export default function TagList({ tags }: TagListProps) {
  const [newTagName, setNewTagName] = useState("")
  const [editingTag, setEditingTag] = useState<{
    id: string
    name: string
  } | null>(null)

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Tags Management</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
        <Button
          onClick={async () => {
            if (newTagName.trim()) {
              await handleCreateTag(newTagName)
              setNewTagName("")
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {tags.length === 0 ? (
        <div>No tags found.</div>
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
                    onClick={async () => {
                      if (editingTag.name.trim()) {
                        await handleUpdateTag(tag.id, editingTag.name)
                        setEditingTag(null)
                      }
                    }}
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
                      onClick={() => handleDeleteTag(tag.id)}
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
    </section>
  )
} 