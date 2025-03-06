import { CardWrapper } from "@/components/auth/card-wrapper"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export const ErrorCard = ({ error }: { error?: string }) => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonLabel="Back to login"
      backButtonHref="/admin/auth/login"
    >
      <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive w-6 h-6" />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        {error || "An error occurred during authentication."}
      </p>
    </CardWrapper>
  )
}
