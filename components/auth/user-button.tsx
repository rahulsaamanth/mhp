"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LogoutButton } from "./logout-button"
import { Icon } from "@iconify/react"

export const UserButton = () => {
  const user = useCurrentUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border-2 focus-visible:invisible">
        <Avatar className="outline-none">
          <AvatarImage
            src={
              user?.image ||
              "https://media.licdn.com/dms/image/v2/D4D0BAQGgmhTnU6j3eQ/company-logo_200_200/company-logo_200_200/0/1703768636553/8ase_logo?e=1739404800&v=beta&t=-lVnJP_MlKg8acV8w3kMLC14qd0mVd-XpOpKov2iOW0"
            }
          />
          <AvatarFallback className="bg-sky-500">
            <Icon
              icon="fa:user"
              width="24"
              height="24"
              style={{ color: "white" }}
            />
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
