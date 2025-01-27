"use server";

import { getQuestionsAction, getQuestionsByTagAction } from "@/actions/questions-actions"
import { getCategoriesAction } from "@/actions/categories-actions"
import { getTagsAction } from "@/actions/tags-actions"
import Link from "next/link"
import { QuestionCard } from "@/app/qna/_components/question-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, MessageSquare, BookmarkIcon, TagIcon, Users, Settings2, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function QnaPage({
  searchParams
}: {
  searchParams: { tags?: string }
}) {
  // Parse tags from URL
  const selectedTagIds = searchParams.tags ? searchParams.tags.split(",") : []

  const [questionsRes, categoriesRes, tagsRes] = await Promise.all([
    selectedTagIds.length > 0
      ? Promise.all(selectedTagIds.map(tagId => getQuestionsByTagAction(tagId)))
        .then(results => {
          // Merge questions from all tags and remove duplicates
          const allQuestions = results.flatMap(r => r.isSuccess ? r.data : [])
          const uniqueQuestions = allQuestions.filter((q, index, self) =>
            index === self.findIndex((t) => t.id === q.id)
          )
          return {
            isSuccess: true,
            message: "Questions retrieved successfully",
            data: uniqueQuestions
          }
        })
      : getQuestionsAction(),
    getCategoriesAction(),
    getTagsAction()
  ])

  const questions = questionsRes.isSuccess ? questionsRes.data : []
  const categories = categoriesRes.isSuccess ? categoriesRes.data : []
  const tags = tagsRes.isSuccess ? tagsRes.data : []

  // Get selected tags info
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  // Function to toggle a tag in the URL
  function getTagToggleUrl(tagId: string) {
    const currentTags = new Set(selectedTagIds)
    if (currentTags.has(tagId)) {
      currentTags.delete(tagId)
    } else {
      currentTags.add(tagId)
    }
    const newTags = Array.from(currentTags)
    return newTags.length > 0 ? `/qna?tags=${newTags.join(",")}` : "/qna"
  }

  return (
    <div className="flex justify-center bg-gray-50/50 min-h-[calc(100vh-4rem)]">
      <div className="flex w-full max-w-7xl">
        {/* Left Sidebar */}
        <div className="w-56 border-r bg-white">
          <div className="p-4 space-y-4">
            <div className="font-medium text-sm text-gray-500">CONTENT</div>
            <div className="space-y-1">
              <Link 
                href="/qna" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                  selectedTagIds.length === 0 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Questions</span>
              </Link>
              <Link href="/qna/bookmarks" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <BookmarkIcon className="h-4 w-4" />
                <span>For You</span>
              </Link>
              <Link href="/qna/bookmarks" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <BookmarkIcon className="h-4 w-4" />
                <span>Bookmarks</span>
              </Link>
              <Link href="/qna/tags" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <TagIcon className="h-4 w-4" />
                <span>Tags</span>
              </Link>
            </div>

            <div className="font-medium text-sm text-gray-500 pt-4">COMMUNITY</div>
            <div className="space-y-1">
              <Link href="/qna/users" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
            </div>

            <div className="font-medium text-sm text-gray-500 pt-4">MANAGE</div>
            <div className="space-y-1">
              <Link href="/qna/settings" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <Settings2 className="h-4 w-4" />
                <span>Admin settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white border-r">
          <div className="border-b">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-semibold mb-2">
                  {selectedTagIds.length > 0 ? "Filtered Questions" : "Questions"}
                </h1>
                {selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500">Filtered by:</span>
                    {selectedTags.map(tag => (
                      <Link 
                        key={tag.id}
                        href={getTagToggleUrl(tag.id)}
                        className="group"
                      >
                        <Badge 
                          variant="secondary" 
                          className="text-sm font-normal cursor-pointer group-hover:bg-gray-200"
                        >
                          {tag.name}
                          <X className="w-3 h-3 ml-1 text-gray-500" />
                        </Badge>
                      </Link>
                    ))}
                    <Link href="/qna">
                      <Button variant="ghost" size="sm">Clear all</Button>
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/qna/create">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ask a question
                </Button>
              </Link>
            </div>
            <div className="px-4 pb-4">
              <Input 
                type="search" 
                placeholder="Search questions..." 
                className="max-w-xl"
              />
            </div>
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
              <Button variant="secondary" size="sm" className="rounded-full">
                Newest
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                Active
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                Bountied
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                Unanswered
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                More
              </Button>
              <Button variant="outline" size="sm" className="rounded-full ml-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="p-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold">No questions yet</h3>
                <p className="text-muted-foreground mt-1">
                  {selectedTagIds.length > 0
                    ? "No questions found with the selected tags."
                    : "Be the first to ask a question!"
                  }
                </p>
                <Link href="/qna/create" className="mt-4 inline-block">
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Ask a question
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-0 divide-y max-w-3xl mx-auto">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    id={question.id}
                    title={question.title}
                    body={question.body}
                    votes={question.votes}
                    answerCount={question.answerCount}
                    hasAcceptedAnswer={question.hasAcceptedAnswer}
                    createdAt={question.createdAt}
                    category={question.category}
                    tags={question.tags}
                    user={question.user}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 bg-white p-4">
          <div className="space-y-6">
            <div>
              <h2 className="font-medium mb-3">Custom Filters</h2>
              <Link href="/qna/filters/create">
                <Button variant="outline" size="sm" className="w-full">
                  Create a custom filter
                </Button>
              </Link>
            </div>

            <div>
              <h2 className="font-medium mb-3">Watched Tags</h2>
              <div className="flex items-center justify-center h-32 border rounded-lg bg-gray-50">
                <div className="text-center p-4">
                  <div className="inline-block p-3 bg-white rounded-full mb-2">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Watch tags to curate your list of questions
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Watch a tag
              </Button>
            </div>

            <div>
              <h2 className="font-medium mb-3">Ignored Tags</h2>
              <Button variant="outline" size="sm" className="w-full">
                Add an ignored tag
              </Button>
            </div>

            <div>
              <h2 className="font-medium mb-3">Related Tags</h2>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <Link 
                    key={tag.id}
                    href={getTagToggleUrl(tag.id)}
                    className={`flex items-center justify-between text-sm p-2 rounded-md transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className={selectedTagIds.includes(tag.id) ? "text-primary" : "text-blue-600 hover:text-blue-700"}>
                      {tag.name}
                    </span>
                    {tag.usageCount !== undefined && (
                      <span className="text-gray-500">×&nbsp;{tag.usageCount}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}