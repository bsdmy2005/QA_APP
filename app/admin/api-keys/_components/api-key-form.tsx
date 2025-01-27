"use client"

import { SelectApiKey } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  createApiKeyAction,
  updateApiKeyAction
} from "@/actions/api-keys-actions"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface ApiKeyFormProps {
  apiKey?: SelectApiKey
}

export function ApiKeyForm({ apiKey }: ApiKeyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const res = apiKey
        ? await updateApiKeyAction(apiKey.id, formData)
        : await createApiKeyAction(formData)

      if (!res.isSuccess) {
        throw new Error(res.message)
      }

      toast({
        title: res.message,
        description: apiKey
          ? undefined
          : `Your API key is: ${res.data.key}. Please save it now as you won't be able to see it again.`
      })

      router.push("/admin/api-keys")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={apiKey?.name}
          placeholder="Enter a name for your API key"
          required
        />
      </div>

      {apiKey && (
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={apiKey.isActive}
            />
            <Label htmlFor="isActive" className="font-normal">
              Active
            </Label>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
        <Input
          type="date"
          id="expiresAt"
          name="expiresAt"
          defaultValue={
            apiKey?.expiresAt
              ? new Date(apiKey.expiresAt).toISOString().split("T")[0]
              : undefined
          }
        />
      </div>

      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={isLoading}>
          {apiKey ? "Update" : "Create"} API Key
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/api-keys")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 