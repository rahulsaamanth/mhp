"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useTransition, useState } from "react"
import { useSession } from "next-auth/react"

import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsSchema } from "@/schemas"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateUser } from "@/actions/settings"
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/use-current-user"

import { getSignedURL } from "@/actions/settings"
import { toast } from "sonner"
import { Icon } from "@iconify/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader } from "lucide-react"

const SettingsPage = () => {
  const user = useCurrentUser()

  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)

  const { update } = useSession()

  const [isPending, startTransition] = useTransition()

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false)

  const [isDirty, setIsDirty] = useState(false)

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      image: undefined,
    },
  })

  const handleFormChange = () => {
    setIsDirty(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImage(file || null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else setPreviewUrl(undefined)
  }

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    return hashHex
  }

  const handleImageUpload = async (file: File) => {
    const signedURLResult = await getSignedURL({
      fileSize: file.size,
      fileType: file.type,
      checksum: await computeSHA256(file),
    })
    if (signedURLResult.error !== undefined)
      throw new Error(signedURLResult.error)
    const url = signedURLResult.success.url
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
    const fileUrl = url.split("?")[0]
    return fileUrl as string
  }

  const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
    if (!isDirty) {
      toast.error("No changes detected!")
      setIsConfirmationDialogOpen(false)
      return
    }

    startTransition(async () => {
      let imageUrl: string | null = null

      if (image) imageUrl = await handleImageUpload(image as File)
      const updateUserParams = imageUrl
        ? { ...values, image: imageUrl }
        : { ...values }
      updateUser(updateUserParams)
        .then((data) => {
          if (data.error) {
            toast.error(data.error)
            setIsConfirmationDialogOpen(false)
          }
          if (data.success) {
            update({
              user: {
                ...user,
                name: values.name,
                email: values.email,
                role: values.role,
                isTwoFactorEnabled: values.isTwoFactorEnabled,
                image: imageUrl || user?.image,
              },
            })
            toast.success(data.success)
            setImage(null)
            setPreviewUrl(undefined)
            setIsConfirmationDialogOpen(false)
          }
          setIsDirty(false)
        })
        .catch(() => toast.error("Something went wrong!"))
    })
  }

  return (
    <section className="grid h-full w-full place-items-center px-6">
      <Card className="w-full rounded-lg bg-white py-2 shadow-lg sm:p-10">
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onChange={handleFormChange}>
              <div className="grid gap-8 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.isOAuth === false && (
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
                              placeholder="john.doe@example.com"
                              type="email"
                              disabled={isPending}
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
                              placeholder="******"
                              type="password"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="******"
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
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={"ADMIN"}>Admin</SelectItem>
                          <SelectItem value={"USER"}>User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.isOAuth === false && (
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Two Factor Authentication</FormLabel>
                          <FormDescription>
                            Enable two factor authentication for your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Profile picture</FormLabel>
                    <FormControl>
                      <section className="flex items-center justify-between">
                        <input
                          type="file"
                          onBlur={field.onBlur}
                          name={field.name}
                          onChange={(e) => {
                            handleImageChange(e)
                          }}
                          ref={field.ref}
                        />
                        {previewUrl && image && (
                          <div className="flex items-center justify-between gap-4">
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                setPreviewUrl(undefined)
                                setImage(null)
                              }}
                            >
                              <Icon
                                icon="iconoir:trash"
                                width="24"
                                height="24"
                                style={{ color: "red" }}
                              />
                            </span>
                            <img
                              width={100}
                              height={100}
                              src={previewUrl}
                              alt="Selected image"
                            />
                          </div>
                        )}
                      </section>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialog open={isConfirmationDialogOpen}>
                <AlertDialogTrigger
                  asChild
                  onClick={() => setIsConfirmationDialogOpen(true)}
                >
                  <Button variant="default">Save</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirm to make changes.
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You can always make changes to profile settings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setIsConfirmationDialogOpen(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader
                          className="mr-2 size-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}

export default SettingsPage
