"use client"

import { SelectBotUser } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createBotUserAction, updateBotUserAction } from "@/actions/bot-users-actions"
import { useState, useEffect } from "react"
import { getAllProfilesAction } from "@/actions/profiles-actions"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface BotUserFormProps {
  botUser?: SelectBotUser
}

interface Profile {
  userId: string
  email: string
  name: string
}

export function BotUserForm({ botUser }: BotUserFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [open, setOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function loadProfiles() {
      const result = await getAllProfilesAction()
      if (result.isSuccess && result.data) {
        // Map the API data to our Profile interface
        const mappedProfiles = result.data.map(profile => ({
          userId: profile.userId,
          email: profile.email,
          name: [profile.firstName, profile.lastName].filter(Boolean).join(" ")
        }))
        setProfiles(mappedProfiles)

        // If editing an existing bot user, set the selected profile
        if (botUser) {
          const existingProfile = mappedProfiles.find(p => p.userId === botUser.userId)
          if (existingProfile) {
            setSelectedProfile(existingProfile)
          }
        }
      }
    }
    loadProfiles()
  }, [botUser])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Add the selected profile data to the form
    if (selectedProfile) {
      formData.set('userId', selectedProfile.userId)
      formData.set('name', selectedProfile.name)
      formData.set('email', selectedProfile.email)
    }
    
    const res = botUser
      ? await updateBotUserAction(botUser.id, formData)
      : await createBotUserAction(formData)

    if (res.isSuccess) {
      toast({
        title: "Success",
        description: res.message
      })
      router.push("/admin/bot-users")
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: res.message,
        variant: "destructive"
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <label htmlFor="botAppName" className="text-sm font-medium">
          Bot App Name
        </label>
        <Input
          id="botAppName"
          name="botAppName"
          defaultValue={botUser?.botAppName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="botAppUserId" className="text-sm font-medium">
          Bot App User ID
        </label>
        <Input
          id="botAppUserId"
          name="botAppUserId"
          defaultValue={botUser?.botAppUserId}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Select User by Email
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedProfile?.email || botUser?.email || "Select a user..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search user by email..." />
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {profiles.map((profile) => (
                  <CommandItem
                    key={profile.userId}
                    onSelect={() => {
                      setSelectedProfile(profile)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProfile?.userId === profile.userId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {profile.email}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedProfile && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Name
            </label>
            <Input
              value={selectedProfile.name}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email
            </label>
            <Input
              value={selectedProfile.email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              User ID
            </label>
            <Input
              value={selectedProfile.userId}
              disabled
            />
          </div>
        </>
      )}

      <Button type="submit">
        {botUser ? "Update" : "Create"} Bot User
      </Button>
    </form>
  )
} 