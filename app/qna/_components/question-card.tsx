"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MessageSquare, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { VoteControls } from "@/components/ui/vote-controls"
import { getUserVoteForQuestionAction, voteQuestionAction } from "@/actions/questions-actions"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  id: string
  title: string
  body: string
  votes: number
  answerCount: number
  hasAcceptedAnswer?: boolean
  createdAt: Date
  category?: {
    id: string
    name: string
  } | null
  tags?: {
    id: string
    name: string
  }[]
  user?: {
    firstName: string | null
    lastName: string | null
  } | null
}

export function QuestionCard({
  id,
  title,
  body,
  votes: initialVotes,
  answerCount,
  hasAcceptedAnswer,
  createdAt,
  category,
  tags,
  user
}: QuestionCardProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getVote()
  }, [])

  const handleVote = async (value: 1 | -1) => {
    if (isLoading) return

    // If user has upvoted and tries to upvote again, ignore it
    if (currentVote === 1 && value === 1) return

    setIsLoading(true)
    try {
      let newVoteCount = votes
      
      if (currentVote === value) {
        // Only allow removing downvote
        if (value === -1) {
          newVoteCount = votes + 1
          setCurrentVote(null)
        }
        // Ignore removing upvote
      } else if (currentVote) {
        // Changing vote
        if (value === 1) {
          // Changing from downvote to upvote
          newVoteCount = votes + 2
          setCurrentVote(value)
        } else {
          // Changing from upvote to downvote
          // Only allow if it won't make the count negative
          newVoteCount = Math.max(0, votes - 2)
          setCurrentVote(value)
        }
      } else {
        // New vote
        if (value === 1) {
          // New upvote
          newVoteCount = votes + 1
          setCurrentVote(value)
        } else {
          // New downvote - only if it won't make the count negative
          newVoteCount = Math.max(0, votes - 1)
          setCurrentVote(value)
        }
      }

      // Update UI optimistically
      setVotes(newVoteCount)

      // Make API call
      const result = await voteQuestionAction(id, value)
      
      if (!result.isSuccess) {
        // Revert on failure
        setVotes(initialVotes)
        setCurrentVote(null)
      }
    } catch (error) {
      console.error("Error voting:", error)
      // Revert on error
      setVotes(initialVotes)
      setCurrentVote(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getVote = async () => {
    try {
      const result = await getUserVoteForQuestionAction(id)
      if (result.isSuccess) {
        setCurrentVote(result.data)
        return result.data
      }
      return null
    } catch (error) {
      console.error("Error getting vote:", error)
      return null
    }
  }

  return (
    <div className="flex gap-6 py-6 px-4 hover:bg-gray-50/50 transition-colors">
      {/* Left Column - Votes and Answers */}
      <div className="flex flex-col items-center gap-3 min-w-[80px]">
        <VoteControls
          id={id}
          votes={votes}
          initialVote={currentVote}
          onVote={handleVote}
          getVote={getVote}
        />
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "flex items-center gap-1",
            hasAcceptedAnswer ? "text-green-600" : "text-muted-foreground"
          )}>
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">{answerCount}</span>
            {hasAcceptedAnswer && (
              <Check className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Question Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/qna/${id}`}
          className="text-lg font-semibold text-blue-600 hover:text-blue-700 line-clamp-1 mb-2"
        >
          {title}
        </Link>

        <div 
          className={cn(
            "prose prose-sm max-w-none text-muted-foreground line-clamp-2 mb-3",
            "prose-p:my-0 prose-headings:my-0"
          )}
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {tags?.map(tag => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <span className="font-medium text-gray-700">
              {user ? `${user.firstName} ${user.lastName}` : 'Anonymous'}
            </span>
            <span>·</span>
            <time dateTime={createdAt.toISOString()} className="text-muted-foreground">
              {format(createdAt, 'MMM d, yyyy h:mm a')}
            </time>
          </div>
        </div>
      </div>
    </div>
  )
}