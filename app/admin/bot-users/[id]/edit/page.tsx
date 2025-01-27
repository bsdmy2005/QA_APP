"use server"

import { getBotUserByIdAction } from "@/actions/bot-users-actions"
import { BotUserForm } from "../../_components/bot-user-form"
import { notFound } from "next/navigation"

interface EditBotUserPageProps {
  params: {
    id: string
  }
}

export default async function EditBotUserPage({ params }: EditBotUserPageProps) {
  const botUserRes = await getBotUserByIdAction(params.id)
  
  if (!botUserRes.isSuccess || !botUserRes.data) {
    notFound()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-8">Edit Bot User</h1>
      <BotUserForm botUser={botUserRes.data} />
    </div>
  )
} 