"use client"

import { SelectBotUser } from "@/db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteBotUserAction } from "@/actions/bot-users-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface BotUsersListProps {
  botUsers: SelectBotUser[]
}

export function BotUsersList({ botUsers }: BotUsersListProps) {
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete(id: string) {
    const res = await deleteBotUserAction(id)
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bot App</TableHead>
            <TableHead>Bot User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mapped User ID</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {botUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No bot users found
              </TableCell>
            </TableRow>
          ) : (
            botUsers.map((botUser) => (
              <TableRow key={botUser.id}>
                <TableCell>{botUser.botAppName}</TableCell>
                <TableCell>{botUser.botAppUserId}</TableCell>
                <TableCell>{botUser.name}</TableCell>
                <TableCell>{botUser.email}</TableCell>
                <TableCell>{botUser.userId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/bot-users/${botUser.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(botUser.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 