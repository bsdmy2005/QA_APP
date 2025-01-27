"use server"

import { AdminSidebar } from "@/app/admin/_components/admin-sidebar"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="px-6">
          {children}
        </div>
      </main>
    </div>
  )
} 