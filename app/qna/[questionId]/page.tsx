"use server";

import { Suspense } from "react"
import { getQuestionByIdAction } from "@/actions/questions-actions"
import { getAnswersAction } from "@/actions/answers-actions"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AnswerForm from "./_components/answer-form"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SelectQuestion } from "@/db/schema"
import { cn } from "@/lib/utils"

interface QuestionWithRelations extends SelectQuestion {
  category?: {
    name: string
  } | null
  tags?: {
    name: string
  }[]
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
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
          <Link href="/qna/create">
            <Button>Ask Question</Button>
          </Link>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>Asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
          <span>·</span>
          <span>by {question.userId}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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

        <div className="mt-6 flex flex-wrap gap-2">
          {question.category && (
            <Badge variant="secondary">
              {question.category.name}
            </Badge>
          )}
          {question.tags?.map((tag) => (
            <Badge 
              key={tag.name}
              variant="outline"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Answers</h2>
        <Suspense fallback={<div className="animate-pulse">Loading answers...</div>}>
          <AnswersSection questionId={params.questionId} />
        </Suspense>

        {!userId ? (
          <div className="mt-8 text-center py-8 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Sign in to answer</h3>
            <p className="text-muted-foreground mt-1">Share your knowledge with the community</p>
          </div>
        ) : (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <AnswerForm questionId={params.questionId} userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}

async function AnswersSection({ questionId }: { questionId: string }) {
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

  return (
    <div className="space-y-6">
      {answers.map((answer) => (
        <div key={answer.id} className="bg-white rounded-lg shadow-sm border p-6">
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
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>answered {formatDistanceToNow(new Date(answer.createdAt))} ago</span>
              <span>·</span>
              <span>by {answer.userId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{answer.votes} votes</span>
              {answer.isAccepted && (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Accepted
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}