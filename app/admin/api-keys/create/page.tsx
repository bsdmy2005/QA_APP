"use server"

import { ApiKeyForm } from "../_components/api-key-form"

export default async function CreateApiKeyPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-8">Create API Key</h1>
      <ApiKeyForm />
    </div>
  )
} 