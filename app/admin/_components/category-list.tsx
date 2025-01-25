"use client"

import { useState } from "react"
import { SelectCategory } from "@/db/schema"
import { handleCreateCategory, handleUpdateCategory, handleDeleteCategory } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash, Plus } from "lucide-react"

interface CategoryListProps {
  categories: SelectCategory[]
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
  } | null>(null)

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Categories Management</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button
          onClick={async () => {
            if (newCategoryName.trim()) {
              await handleCreateCategory(newCategoryName)
              setNewCategoryName("")
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <div>No categories found.</div>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="border rounded p-2 flex justify-between items-center"
            >
              {editingCategory?.id === category.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value
                      })
                    }
                  />
                  <Button
                    onClick={async () => {
                      if (editingCategory.name.trim()) {
                        await handleUpdateCategory(
                          category.id,
                          editingCategory.name
                        )
                        setEditingCategory(null)
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span>{category.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        setEditingCategory({
                          id: category.id,
                          name: category.name
                        })
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
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