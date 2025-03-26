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

  if (status === "loading") {
    return (
      <Avatar>
        <AvatarFallback>
          <span className="animate-pulse">...</span>
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border-2 focus-visible:outline-none">
        <Avatar>
          {user ? (
            <AvatarImage
              src={user?.image || ""}
              alt={user?.name || "Profile"}
              className="object-cover"
            />
          ) : (
            <AvatarFallback>
              <User className="text-black size-4" />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem className="flex items-center justify-center gap-3 pb-2">
          <Avatar className="size-8">
            {user ? (
              <AvatarImage
                src={user?.image || ""}
                alt={user?.name || "Profile"}
              />
            ) : (
              <AvatarFallback className="size-8">
                <User className="size-4 text-black" />
              </AvatarFallback>
            )}
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
