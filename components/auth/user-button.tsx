"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Icon } from "@iconify/react"
import { User } from "lucide-react"
import { LogoutButton } from "./logout-button"
import React from "react"
import { useSession } from "next-auth/react"

export const UserButton = () => {
  const { data: session, status } = useSession()
  const user = session?.user

  // Show loading state
  if (status === "loading") {
    return (
      <Avatar className="animate-pulse">
        <AvatarFallback className="bg-gray-200">
          <User className="text-gray-400 size-4" />
        </AvatarFallback>
      </Avatar>
    )
  }

  // Show guest state if no user
  if (!user) {
    return (
      <Avatar>
        <AvatarFallback>
          <User className="text-black size-4" />
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border-2 focus-visible:outline-none">
        <Avatar>
          <AvatarImage
            src={user.image || ""}
            alt={user.name || "Profile"}
            className="object-cover"
          />
          <AvatarFallback>
            {user.name?.[0]?.toUpperCase() || (
              <User className="text-black size-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem className="flex items-center justify-center gap-3 pb-2">
          <Avatar className="size-8">
            <AvatarImage
              src={user?.image || ""}
              alt={user?.name || "Profile"}
            />

            <AvatarFallback>
              {user.name?.[0]?.toUpperCase() || (
                <User className="text-black size-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <span>{user?.name || "User"}</span>
        </DropdownMenuItem>
        <hr />
        <LogoutButton>
          <DropdownMenuItem className="cursor-pointer space-x-2">
            <Icon icon="material-symbols:logout-sharp" width="20" height="20" />
            <span>Logout</span>
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
