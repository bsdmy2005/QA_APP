"use client"

import { useState } from "react"
import { SelectCategory } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction
} from "@/actions/categories-actions"

interface CategoryListProps {
  categories: SelectCategory[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleCreate() {
    if (newCategoryName.trim()) {
      const res = await createCategoryAction(newCategoryName)
      if (res.isSuccess) {
        toast({
          title: "Success",
          description: res.message
        })
        setNewCategoryName("")
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
      const res = await updateCategoryAction(id, name)
      if (res.isSuccess) {
        toast({
          title: "Success",
          description: res.message
        })
        setEditingCategory(null)
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
    const res = await deleteCategoryAction(id)
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
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No categories found
        </div>
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
                    onClick={() => handleUpdate(category.id, editingCategory.name)}
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
                      onClick={() => handleDelete(category.id)}
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