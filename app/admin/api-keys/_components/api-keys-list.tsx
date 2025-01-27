"use client"

import { SelectApiKey } from "@/db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Copy, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { deleteApiKeyAction } from "@/actions/api-keys-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface ApiKeysListProps {
  apiKeys: SelectApiKey[]
}

export function ApiKeysList({ apiKeys }: ApiKeysListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function handleDelete(id: string) {
    try {
      const res = await deleteApiKeyAction(id)
      if (!res.isSuccess) {
        throw new Error(res.message)
      }

      toast({
        title: res.message
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    }
  }

  async function copyToClipboard(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast({
      title: "Copied!",
      description: "API key copied to clipboard"
    })
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No API keys found
              </TableCell>
            </TableRow>
          ) : (
            apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{apiKey.name}</div>
                    {apiKey.description && (
                      <div className="text-sm text-muted-foreground">
                        {apiKey.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {apiKey.key.slice(0, 12)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      {copiedKey === apiKey.key ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={apiKey.isActive ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {apiKey.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {apiKey.lastUsedAt
                    ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  {apiKey.expiresAt
                    ? new Date(apiKey.expiresAt).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/api-keys/${apiKey.id}`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(apiKey.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 
