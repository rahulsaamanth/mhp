"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"

import { newVerification } from "@/actions/auth/new-verification"
import { CardWrapper } from "./card-wrapper"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { Loader } from "lucide-react"

export const NewVerificationFormContent = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()

  const token = searchParams?.get("token")

  const onSubmit = useCallback(() => {
    if (success || error) return

    if (!token) {
      setError("Missing token!")
      return
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch(() => {
        setError("Something went wrong!")
      })
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])
  return (
    <CardWrapper
      headerLabel="confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/admin/auth/login"
    >
      <div className="flex w-full flex-col items-center justify-center">
        {!success && !error && <Loader className="size-4 animate-spin" />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  )
}

const NewVerificationFormLoading = () => {
  return (
    <CardWrapper
      headerLabel="Reset Password"
      backButtonLabel="Back to Login"
      backButtonHref="/admin/auth/login"
    >
      <div className="space-y-4">
        <Loader className="size-4 animate-spin" />
      </div>
    </CardWrapper>
  )
}

export const NewVerificationForm = () => {
  return (
    <Suspense fallback={<NewVerificationFormLoading />}>
      <NewVerificationFormContent />
    </Suspense>
  )
}
