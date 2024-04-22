"use client"

import React from "react"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"

import useScroll from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { UserButton } from "./auth/user-button"

const Header = () => {
  const user = useCurrentUser()

  const scrolled = useScroll(5)
  const selectedLayout = useSelectedLayoutSegment()

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-200 h-16`,
        {
          "border-b border-gray-200 bg-white/75 backdrop-blur-lg": scrolled,
          "border-b border-gray-200 bg-white": selectedLayout,
        }
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="md:hidden">
            <span className="font-bold text-xl flex">Logo</span>
          </Link>
        </div>

        {/* <>
          <div className="flex items-center gap-4 w-full justify-center">
            <span>welcome</span>

            <span>
              <Icon icon="uil:user" />
            </span>
            <span>{user?.name}</span>
          </div>
        </> */}

        <div className="hidden md:block">
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Header
