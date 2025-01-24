import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileByIdAction } from "@/actions/profiles-actions";

export default async function AdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const profileResult = await getProfileByIdAction(userId);
  const isAdmin = profileResult.data?.role === 'admin';

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin area!</p>
    </div>
  );
} 