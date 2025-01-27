"use server"

import { BotUserForm } from "../_components/bot-user-form"

export default async function CreateBotUserPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-8">Create Bot User</h1>
      <BotUserForm />
    </div>
  )
} 