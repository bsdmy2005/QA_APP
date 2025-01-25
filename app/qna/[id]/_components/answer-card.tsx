"use client"

import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { VoteControls } from "@/components/ui/vote-controls"
import { getUserVoteForAnswerAction, voteAnswerAction } from "@/actions/answers-actions"
import type { AnswerWithUser } from "@/db/queries/answers-queries"

interface AnswerCardProps {
  answer: AnswerWithUser
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const handleVote = async (value: 1 | -1) => {
    await voteAnswerAction(answer.id, value)
  }

  const getVote = async () => {
    const result = await getUserVoteForAnswerAction(answer.id)
    return result.isSuccess ? result.data : null
  }

  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <VoteControls
          id={answer.id}
          votes={answer.votes}
          initialVote={null}
          onVote={handleVote}
          getVote={getVote}
        />

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-muted-foreground">{answer.body}</p>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            {answer.user && (
              <span>
                {answer.user.firstName} {answer.user.lastName}
              </span>
            )}
            <span>·</span>
            <time dateTime={answer.createdAt.toISOString()}>
              {format(answer.createdAt, "MMM d, yyyy")}
            </time>
          </div>
        </div>
      </div>
    </Card>
  )
} 