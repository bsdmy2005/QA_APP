"use client"

import { handleDeleteQuestion } from "../actions"
import { SelectQuestion } from "@/db/schema"

interface QuestionListProps {
  questions: SelectQuestion[]
}

export default function QuestionList({ questions }: QuestionListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">QnA Management</h2>
      {questions.length === 0 ? (
        <div>No questions found.</div>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id} className="border rounded p-2 flex justify-between items-center">
              <div>
                <p className="font-semibold">{q.title}</p>
                <p className="text-sm text-gray-500">ID: {q.id}</p>
              </div>
              <form action={async () => {
                await handleDeleteQuestion(q.id)
              }}>
                <button
                  type="submit"
                  className="px-4 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
} 