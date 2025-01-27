"use server";

import { Suspense } from "react"
import { getQuestionByIdAction } from "@/actions/questions-actions"
import { 
  getAnswersAction, 
  acceptAnswerAction, 
  unacceptAnswerAction,
  voteAnswerAction,
  getUserVoteForAnswerAction 
} from "@/actions/answers-actions"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AnswerForm from "./_components/answer-form"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SelectQuestion, SelectAnswer } from "@/db/schema"
import { cn } from "@/lib/utils"
import { VoteControls } from "@/components/ui/vote-controls"

interface QuestionWithRelations extends SelectQuestion {
  category?: {
    name: string
  } | null
  tags?: {
    name: string
  }[]
  user?: {
    firstName: string
    lastName: string
  } | null
}

interface AnswerWithUser extends SelectAnswer {
  user?: {
    firstName: string
    lastName: string
  } | null
}

export default async function QuestionDetailPage({ params }: { params: { questionId: string } }) {
  const { userId } = await auth()

  const questionRes = await getQuestionByIdAction(params.questionId)
  if (!questionRes.isSuccess || !questionRes.data) {
    return <div className="p-6">Question not found</div>
  }

  const question = questionRes.data as QuestionWithRelations

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{question.title}</h1>
          <Link href="/qna/create">
            <Button>Ask Question</Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span>Asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>Modified {formatDistanceToNow(new Date(question.updatedAt))} ago</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="grid grid-cols-[auto,1fr] gap-6">
        {/* Voting */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <VoteControls
            id={question.id}
            votes={question.votes}
            initialVote={null}
            onVote={async (value) => {
              'use server'
              // TODO: Implement question voting
            }}
            getVote={async () => {
              'use server'
              // TODO: Implement get user vote for question
              return null
            }}
          />
        </div>

        {/* Content */}
        <div className="min-w-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div 
              className={cn(
                "prose max-w-none",
                "prose-headings:mt-4 prose-headings:mb-2",
                "prose-p:my-2",
                "prose-ul:my-2 prose-li:my-0",
                "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg"
              )}
              dangerouslySetInnerHTML={{ __html: question.body }}
            />

            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {question.category && (
                  <Badge variant="secondary" className="px-3">
                    {question.category.name}
                  </Badge>
                )}
                {question.tags?.map((tag) => (
                  <Badge 
                    key={tag.name}
                    variant="outline"
                    className="px-3"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>asked by</span>
                <span className="font-medium text-foreground">
                  {question.user ? `${question.user.firstName} ${question.user.lastName}` : 'Unknown User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8 pt-4 border-t">
        <Suspense fallback={<div className="animate-pulse">Loading answers...</div>}>
          <AnswersSection questionId={params.questionId} currentUserId={userId} questionUserId={question.userId} />
        </Suspense>

        {!userId ? (
          <div className="mt-8 text-center py-8 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Sign in to answer</h3>
            <p className="text-muted-foreground mt-1">Share your knowledge with the community</p>
          </div>
        ) : (
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <AnswerForm questionId={params.questionId} userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}

async function AnswersSection({ 
  questionId, 
  currentUserId,
  questionUserId
}: { 
  questionId: string
  currentUserId: string | null
  questionUserId: string
}) {
  const answersRes = await getAnswersAction(questionId)
  const answers = answersRes.isSuccess && answersRes.data ? answersRes.data : []

  if (answers.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-lg border">
        <h3 className="text-lg font-semibold">No answers yet</h3>
        <p className="text-muted-foreground mt-1">Be the first to answer this question!</p>
      </div>
    )
  }

  // Sort answers - accepted answers first, then by votes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.accepted && !b.accepted) return -1
    if (!a.accepted && b.accepted) return 1
    return (b.votes || 0) - (a.votes || 0)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md font-medium text-sm",
              answers.some(a => a.accepted) 
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                answers.some(a => a.accepted) ? "bg-green-500" : "bg-blue-500"
              )} />
              <span>
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </span>
              {answers.some(a => a.accepted) && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
          {answers.some(a => a.accepted) && (
            <span className="text-sm text-green-600">
              Has accepted answer
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select className="text-sm border rounded px-2 py-1">
            <option>Highest score (default)</option>
            <option>Trending (recent votes)</option>
            <option>Date modified</option>
            <option>Date created</option>
          </select>
        </div>
      </div>

      {sortedAnswers.map((answer) => (
        <div 
          key={answer.id} 
          className={cn(
            "grid grid-cols-[auto,1fr] gap-6",
            answer.accepted && "relative"
          )}
        >
          {/* Voting */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <VoteControls
              id={answer.id}
              votes={answer.votes}
              initialVote={null}
              onVote={async (value) => {
                'use server'
                // Just record the vote without refreshing
                await voteAnswerAction(answer.id, value)
              }}
              getVote={async () => {
                'use server'
                const result = await getUserVoteForAnswerAction(answer.id)
                return result.isSuccess ? result.data : null
              }}
            />
          </div>

          {/* Content */}
          <div className="min-w-0">
            <div 
              className={cn(
                "bg-white rounded-lg shadow-sm border p-6",
                answer.accepted && "border-green-500/50 shadow-[0_0_0_1px] shadow-green-500/50"
              )}
            >
              {answer.accepted && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Accepted Answer
                  </Badge>
                </div>
              )}
              
              <div 
                className={cn(
                  "prose max-w-none",
                  "prose-headings:mt-4 prose-headings:mb-2",
                  "prose-p:my-2",
                  "prose-ul:my-2 prose-li:my-0",
                  "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg"
                )}
                dangerouslySetInnerHTML={{ __html: answer.body }}
              />

              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    answered {formatDistanceToNow(new Date(answer.createdAt))} ago
                  </span>
                  <span className="text-sm">
                    by <span className="font-medium">
                      {answer.user ? `${answer.user.firstName} ${answer.user.lastName}` : 'Unknown User'}
                    </span>
                  </span>
                </div>

                {currentUserId === questionUserId && (
                  <form action={async () => {
                    'use server'
                    if (answer.accepted) {
                      await unacceptAnswerAction(answer.id)
                    } else {
                      await acceptAnswerAction(answer.id)
                    }
                  }}>
                    <Button 
                      type="submit"
                      variant={answer.accepted ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-1",
                        answer.accepted && "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      {answer.accepted ? "Accepted" : "Accept"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}