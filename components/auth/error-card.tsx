import { CardWrapper } from "./card-wrapper"
import { Icon } from "@iconify/react"

export const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! something went wrong!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex justify-center items-center">
        <Icon icon="bi:exclamation-triangle" width="16" height="16" />
      </div>
    </CardWrapper>
  )
}
