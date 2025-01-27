"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Tags,
  FolderKanban,
  MessageSquare,
  Bot,
  Settings,
  Key
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "Bot Users",
    href: "/admin/bot-users",
    icon: Bot
  },
  {
    name: "Questions",
    href: "/admin/questions",
    icon: MessageSquare
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderKanban
  },
  {
    name: "Tags",
    href: "/admin/tags",
    icon: Tags
  },
  {
    name: "API Keys",
    href: "/admin/api-keys",
    icon: Key
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-white">
      <div className="flex h-full flex-col gap-y-5 px-4 py-6">
        <div className="font-semibold px-2">Admin Panel</div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm font-medium hover:bg-gray-50 hover:text-primary",
                    pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
} 