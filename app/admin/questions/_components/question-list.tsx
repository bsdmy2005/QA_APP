"use client"

import { SelectQuestion } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Trash2, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { deleteQuestionAction } from "@/actions/questions-actions"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface QuestionListProps {
  questions: (SelectQuestion & {
    answers: unknown[]
    category: { id: string; name: string } | null
  })[]
}

export function QuestionList({ questions }: QuestionListProps) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    const res = await deleteQuestionAction(id)
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
    <div className="space-y-0 divide-y">
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold">No questions yet</h3>
          <p className="text-muted-foreground mt-1">
            No questions have been created yet.
          </p>
        </div>
      ) : (
        questions.map((question) => (
          <div key={question.id} className="flex gap-6 py-6 px-4 hover:bg-gray-50/50 transition-colors">
            {/* Left Column - Stats */}
            <div className="flex flex-col items-center gap-3 min-w-[80px]">
              <div className="text-center">
                <div className="text-xl font-semibold">{question.votes}</div>
                <div className="text-xs text-muted-foreground">votes</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{question.answers?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Question Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 line-clamp-1 mb-2">
                    {question.title}
                  </h3>
                  <div 
                    className={cn(
                      "prose prose-sm max-w-none text-muted-foreground line-clamp-2 mb-3",
                      "prose-p:my-0 prose-headings:my-0"
                    )}
                    dangerouslySetInnerHTML={{ __html: question.body }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-wrap gap-2">
                  {question.category && (
                    <Badge variant="secondary" className="text-xs">
                      {question.category.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                  <time dateTime={question.createdAt.toISOString()} className="text-muted-foreground">
                    {format(question.createdAt, 'MMM d, yyyy')}
                  </time>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
} 
