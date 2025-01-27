import { SelectCategory, SelectQuestion } from "@/db/schema"

export interface QuestionWithRelations extends SelectQuestion {
  category: SelectCategory | null
  answerCount: number
  hasAcceptedAnswer: boolean
  tags: {
    id: string
    name: string
  }[]
  user: {
    firstName: string | null
    lastName: string | null
  } | null
} 