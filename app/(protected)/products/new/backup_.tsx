"use client"

import { createProduct } from "@/actions/products"
import Tiptap from "@/components/editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProductSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ChevronLeft, FormInput } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const AddNewProductPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    manufacturerId: "",
  })
  // const handleSubmit = useCallback(
  //   async (e: React.FormEvent) => {
  //     e.preventDefault()
  //     setIsLoading(true)

  //     try {
  //       const response = await fetch("/api/products/new", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(formData),
  //       })

  //       const data = await response.json()

  //       if (response.ok) {
  //         toast.success("Product created successfully!")
  //         setFormData({
  //           name: "",
  //           description: "",
  //           categoryId: "",
  //           manufacturerId: "",
  //         })
  //       } else {
  //         toast.error(data.error || "Failed to create product")
  //       }
  //     } catch (error) {
  //       toast.error("Something went wrong!")
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   },
  //   [formData]
  // )

  const { mutate: server_addProduct, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product created successfully!")

        setFormData({
          name: "",
          description: "",
          categoryId: "",
          manufacturerId: "",
        })
      } else {
        toast.error(data.error || "Failed to create product")
      }
    },
    onError: (error) => {
      toast.error("Something went wrong!")
      console.error("Error creating product:", error)
    },
  })

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      manufacturer: "",
      tags: [],
      variants: [],
    },
  })

  const router = useRouter()

  return (
    <section className="flex flex-col sm:gap-4 sm:py-4">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="geid flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <Form {...form}>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => router.back()}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tighter sm:grow-0">
                Product Controller
              </h1>
              <Badge variant="destructive" className="ml-auto sm:ml-0">
                New
              </Badge>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm">Save Product</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Details</CardTitle>
                      <CardDescription>
                        Lipsum dolor sit amet, consectetur adipiscing elit
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormInput>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Dr. reckweg" />
                                </FormControl>
                              </FormInput>
                            )}
                          />
                        </div>
                        <div className="grid gap-3">
                          {/* <Label htmlFor="description">Description</Label>
                        <Tiptap val="" /> */}
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormInput>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Tiptap val="" {...field} />
                                </FormControl>
                              </FormInput>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </main>
    </section>
  )
}

export default AddNewProductPage
