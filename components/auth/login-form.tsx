"use client"

import React, { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import * as z from "zod"
import { Loader } from "lucide-react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { LoginSchema } from "@/schemas"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { CardWrapper } from "./card-wrapper"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { login } from "@/actions/auth/login"
import { Skeleton } from "../ui/skeleton"
// import Link from "next/link"

export const LoginFormContent = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin/dashboard"
  const error = searchParams?.get("error")

  const urlError =
    error === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : ""

  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const [_error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")

  const [isPending, startTransition] = React.useTransition()
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")
    startTransition(async () => {
      const data = await login(values, callbackUrl)

      if (data?.error) {
        form.reset()
        setError(data.error)
      }

      if (data?.success) {
        setSuccess(data.success)
      }

      if (data?.twoFactor) {
        setShowTwoFactor(true)
      }
    })
  }

  return (
    <CardWrapper
      headerLabel="welcome back"
      backButtonLabel="Forgot Pasword?"
      backButtonHref="/admin/auth/reset"
      // showSocial={!showTwoFactor}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MFA Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        type="text"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="john.reese@example.com"
                          type="email"
                          disabled={isPending}
                          autoFocus={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="********"
                          type="password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={_error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {showTwoFactor ? "Confirming..." : "Logging in..."}
              </>
            ) : showTwoFactor ? (
              "Confirm"
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}

const LoginFormLoading = () => {
  return (
    <CardWrapper
      headerLabel="Reset Password"
      backButtonLabel="Back to Login"
      backButtonHref="/admin/auth/login"
    >
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardWrapper>
  )
}

export const LoginForm = () => {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormContent />
    </Suspense>
  )
}
