"use server"

import { getBotUsersAction } from "@/actions/bot-users-actions"
import { BotUsersList } from "./_components/bot-users-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function BotUsersPage() {
  const botUsersRes = await getBotUsersAction()
  const botUsers = botUsersRes.isSuccess ? botUsersRes.data : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Bot Users</h1>
        <Link href="/admin/bot-users/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Bot User
          </Button>
        </Link>
      </div>

      <BotUsersList botUsers={botUsers} />
    </div>
  )
} 