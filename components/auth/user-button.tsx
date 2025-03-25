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
import { Skeleton } from "@/components/ui/skeleton"

export const UserButton = () => {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border-2 focus-visible:outline-none">
        <Avatar>
          {user?.image ? (
            <AvatarImage
              src={user.image}
              alt={user?.name || "Profile"}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-sky-500">
              <User className="text-white h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem className="flex items-center justify-center gap-3 pb-2">
          <Avatar className="size-8">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user?.name || "Profile"} />
            ) : (
              <AvatarFallback className="size-8 bg-sky-500">
                <Icon
                  icon="fa:user"
                  width="16"
                  height="16"
                  className="text-white"
                />
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
