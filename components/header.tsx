"use client"

import React from "react"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"

import useScroll from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"

import { UserButton } from "./auth/user-button"
import Image from "next/image"

const Header = () => {
  const scrolled = useScroll(5)
  const selectedLayout = useSelectedLayoutSegment()

  // sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-50 h-20 w-full border-b border-border/40 border-gray-200 transition-all bg-white`,
        {
          "bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/50":
            scrolled,
          "bg-white": selectedLayout,
        }
      )}
    >
      <div className="flex h-full items-center justify-between px-10">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="xl:hidden ml-4">
            <Image
              src="/logo.png"
              alt="failed to load logo : header"
              width={120}
              height={120}
            />
          </Link>
        </div>

        <div className="hidden xl:block">
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Header
