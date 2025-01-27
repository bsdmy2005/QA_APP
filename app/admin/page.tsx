"use server"

export default async function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add dashboard cards/stats here */}
      </div>
    </div>
  )
}