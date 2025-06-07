"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginButtonProps {
  children: React.ReactNode
  mode?: "modal" | "redirect"
  asChild?: boolean
}

export const LoginButton = ({
  children,
  mode = "redirect",
  asChild,
}: LoginButtonProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = () => {
    setIsLoading(true)
    router.push("/admin/auth/login")
  }

  if (mode === "modal") {
    return <span>TODO:Implement modal</span>
  }

  return (
    <Button
      onClick={onClick}
      className="cursor-pointer inline-flex items-center rounded-none"
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          <span>Redirecting...</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
