import { CheckCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"

type FormSuccessProps = {
  message?: string
  duration?: number
}

export const FormSuccess = ({ message, duration = 3000 }: FormSuccessProps) => {
  if (!message) return null

  const [visible, setVisible] = useState<boolean>(true)

  setTimeout(() => {
    setVisible(false)
  }, duration)

  return (
    visible && (
      <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
        <CheckCircledIcon className="h-4 w-4" />
        <p>{message}</p>
      </div>
    )
  )
}
