"use client"

import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  direction: "up" | "down"
  isActive: boolean
  onClick: () => void
  className?: string
}

export function VoteButton({
  direction,
  isActive,
  onClick,
  className
}: VoteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-auto p-2 hover:bg-muted",
        isActive && "text-primary",
        className
      )}
      onClick={onClick}
    >
      {direction === "up" ? (
        <ThumbsUp className="h-4 w-4" />
      ) : (
        <ThumbsDown className="h-4 w-4" />
      )}
    </Button>
  )
} 