import { Icon } from "@iconify/react"

type FormErrorProps = {
  message?: string
  duration?: number
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <Icon icon="bi:exclamation-triangle" width="16" height="16" />
      <p>{message}</p>
    </div>
  )
}
