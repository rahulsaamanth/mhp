import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useState } from "react"

type FormErrorProps = {
  message?: string
  duration?: number
}

export const FormError = ({ message, duration = 3000 }: FormErrorProps) => {
  if (!message) return null

  const [visible, setVisible] = useState<boolean>(true)

  setTimeout(() => {
    setVisible(false)
  }, duration)

  return (
    visible && (
      <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <p>{message}</p>
      </div>
    )
  )
}
