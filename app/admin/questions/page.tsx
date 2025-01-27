"use server"

import { getQuestionsWithRelationsAction } from "@/actions/questions-actions"
import { QuestionList } from "./_components/question-list"

export default async function QuestionsPage() {
  const questionsRes = await getQuestionsWithRelationsAction()
  const questions = questionsRes.isSuccess ? questionsRes.data : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Questions</h1>
      </div>

      <QuestionList questions={questions} />
    </div>
  )
} 