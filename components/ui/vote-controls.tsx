"use client"

import { useEffect, useState, useCallback } from "react"
import { VoteButton } from "./vote-button"
import { useRouter } from "next/navigation"
import { debounce } from "lodash"

interface VoteControlsProps {
  id: string
  votes: number
  initialVote: number | null
  onVote: (value: 1 | -1) => Promise<void>
  getVote: () => Promise<number | null>
  className?: string
}

export function VoteControls({
  id,
  votes,
  initialVote,
  onVote,
  getVote,
  className
}: VoteControlsProps) {
  const [currentVote, setCurrentVote] = useState<number | null>(initialVote)
  const [localVotes, setLocalVotes] = useState(votes)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Debounced refresh function with a much longer delay (10 seconds)
  const debouncedRefresh = useCallback(
    debounce(() => {
      router.refresh()
    }, 10000), // Increased from 2000ms to 10000ms
    [router]
  )

  // Update local votes when server votes change
  useEffect(() => {
    setLocalVotes(votes)
  }, [votes])

  useEffect(() => {
    const fetchVote = async () => {
      const vote = await getVote()
      setCurrentVote(vote)
    }

    if (initialVote === null) {
      fetchVote()
    }
  }, [getVote, initialVote])

  const handleVote = async (value: 1 | -1) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      // Calculate new vote count optimistically
      let newVoteCount = localVotes
      if (currentVote === value) {
        // Removing vote
        newVoteCount -= value
        setCurrentVote(null)
      } else if (currentVote) {
        // Changing vote
        newVoteCount = localVotes + (value * 2)
        setCurrentVote(value)
      } else {
        // New vote
        newVoteCount = localVotes + value
        setCurrentVote(value)
      }

      // Update UI immediately
      setLocalVotes(newVoteCount)

      // Make API call
      await onVote(value)

      // Trigger debounced refresh
      debouncedRefresh()
    } catch (error) {
      console.error("Error voting:", error)
      // Revert on error
      setLocalVotes(votes)
      setCurrentVote(initialVote)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <VoteButton
        direction="up"
        isActive={currentVote === 1}
        onClick={() => handleVote(1)}
      />
      <span className="min-w-[2ch] text-center tabular-nums">{localVotes}</span>
      <VoteButton
        direction="down"
        isActive={currentVote === -1}
        onClick={() => handleVote(-1)}
      />
    </div>
  )
} 