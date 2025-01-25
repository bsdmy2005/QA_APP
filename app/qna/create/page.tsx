"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import CreateQuestionForm from "./_components/create-question-form"

export default async function CreateQuestionPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  return <CreateQuestionForm userId={userId} />
}