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

export const UserButton = () => {
  const user = useCurrentUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border-2 focus-visible:invisible">
        <Avatar className="outline-none">
          <AvatarImage
            src={user?.image || ""}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem className="flex items-center justify-center gap-3 pb-2">
          <Avatar className="size-8">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="size-8 bg-sky-500">
              <Icon
                icon="fa:user"
                width="16"
                height="16"
                style={{ color: "white" }}
              />
            </AvatarFallback>
          </Avatar>
          <span>{user?.name}</span>
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
