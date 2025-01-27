"use server"

import { getApiKeysAction } from "@/actions/api-keys-actions"
import { ApiKeysList } from "./_components/api-keys-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function ApiKeysPage() {
  const apiKeysRes = await getApiKeysAction()
  const apiKeys = apiKeysRes.isSuccess ? apiKeysRes.data : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <Link href="/admin/api-keys/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </Link>
      </div>

      <ApiKeysList apiKeys={apiKeys} />
    </div>
  )
} 