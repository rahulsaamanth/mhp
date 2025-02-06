"use client"

import Image from "next/image"

import { ChevronLeft, Loader, PlusCircle, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRouter } from "next/navigation"
import Tiptap from "@/components/editor"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createProductSchema } from "@/schemas"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import React from "react"

import { getCategories, getManufacturers } from "@/actions/categories"
import { createProduct } from "@/actions/products"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

type FormattedCategory = {
  id: string
  name: string
  parentId: string | null
  formattedName: string
}

type Manufacturer = {
  name: string
  id: string
}

export default function createProductPage() {
  const router = useRouter()

  const [categories, setCategories] = React.useState<FormattedCategory[]>([])
  const [manufacturers, setManufacturers] = React.useState<Manufacturer[]>([])

  const form = useForm<z.infer<typeof createProductSchema>>({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      manufacturerId: "",
      tags: [],
    },
    mode: "onChange",
  })

  React.useEffect(() => {
    const fetchCategories = async () => {
      const [categories, manufacturers] = await Promise.all([
        getCategories(),
        getManufacturers(),
      ])

      const categoryMap: Record<string, string> = categories.reduce(
        (acc, category) => {
          acc[category.id] = category.name
          return acc
        },
        {} as Record<string, string>
      )

      const formattedCategories = categories.map((category) => {
        const formattedName = category.parentId
          ? `${categoryMap[category.parentId]}/${category.name}`
          : category.name

        return { ...category, formattedName }
      })

      setCategories(formattedCategories)

      setManufacturers(manufacturers)
    }
    fetchCategories()
  }, [])

  const [isPending, startTransition] = React.useTransition()

  // const { mutate: server_addProduct, isPending } = useMutation({
  //   mutationFn: createProduct,
  //   onSuccess: (data) => {
  //     if (data.success) {
  //       toast.success("Product created successfully!")
  //       router.refresh()
  //     } else {
  //       toast.error(data.error || "Failed to create product")
  //     }
  //   },
  //   onError: (error) => {
  //     toast.error("Something went wrong!")
  //     console.error("Error creating product:", error)
  //   },
  // })

  function onSubmit(data: z.infer<typeof createProductSchema>) {
    startTransition(async () => {
      createProduct(data)
        .then((data) => {
          if (data.success) {
            toast.success("Product created successfully!")
            router.refresh()
          }
          if (data.error) {
            toast.error(data.error || "Failed to create product")
          }
        })
        .catch(() => toast.error("Something went wrong!"))
    })
  }

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid  flex-1 auto-rows-max gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  Add Product
                </h1>
                <Badge variant="destructive" className="ml-auto sm:ml-0">
                  new
                </Badge>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                  <Button variant="outline" size="sm">
                    Discard
                  </Button>
                  <Button size="sm" disabled={isPending}>
                    {isPending && <Loader className="size-4" />}
                    {isPending ? "Saving..." : "Save Product"}
                  </Button>
                </div>
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
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter Product Name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Tiptap val={field.value} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Category and Manufacturer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 sm:grid-cols-3">
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Category</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.formattedName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="manufacturerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Manufacturer</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select manufacturer" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {manufacturers.map((manfacturer) => (
                                      <SelectItem
                                        key={manfacturer.id}
                                        value={manfacturer.id}
                                      >
                                        {manfacturer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* <Card>
                    <CardHeader>
                      <CardTitle>Stock</CardTitle>
                      <CardDescription>
                        Lipsum dolor sit amet, consectetur adipiscing elit
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">SKU</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="w-[100px]">Size</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-semibold">
                              GGPC-001
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="stock-1" className="sr-only">
                                Stock
                              </Label>
                              <Input
                                id="stock-1"
                                type="number"
                                defaultValue="100"
                              />
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="price-1" className="sr-only">
                                Price
                              </Label>
                              <Input
                                id="price-1"
                                type="number"
                                defaultValue="99.99"
                              />
                            </TableCell>
                            <TableCell>
                              <ToggleGroup
                                type="single"
                                defaultValue="s"
                                variant="outline"
                              >
                                <ToggleGroupItem value="s">S</ToggleGroupItem>
                                <ToggleGroupItem value="m">M</ToggleGroupItem>
                                <ToggleGroupItem value="l">L</ToggleGroupItem>
                              </ToggleGroup>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">
                              GGPC-002
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="stock-2" className="sr-only">
                                Stock
                              </Label>
                              <Input
                                id="stock-2"
                                type="number"
                                defaultValue="143"
                              />
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="price-2" className="sr-only">
                                Price
                              </Label>
                              <Input
                                id="price-2"
                                type="number"
                                defaultValue="99.99"
                              />
                            </TableCell>
                            <TableCell>
                              <ToggleGroup
                                type="single"
                                defaultValue="m"
                                variant="outline"
                              >
                                <ToggleGroupItem value="s">S</ToggleGroupItem>
                                <ToggleGroupItem value="m">M</ToggleGroupItem>
                                <ToggleGroupItem value="l">L</ToggleGroupItem>
                              </ToggleGroup>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-semibold">
                              GGPC-003
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="stock-3" className="sr-only">
                                Stock
                              </Label>
                              <Input
                                id="stock-3"
                                type="number"
                                defaultValue="32"
                              />
                            </TableCell>
                            <TableCell>
                              <Label htmlFor="price-3" className="sr-only">
                                Stock
                              </Label>
                              <Input
                                id="price-3"
                                type="number"
                                defaultValue="99.99"
                              />
                            </TableCell>
                            <TableCell>
                              <ToggleGroup
                                type="single"
                                defaultValue="s"
                                variant="outline"
                              >
                                <ToggleGroupItem value="s">S</ToggleGroupItem>
                                <ToggleGroupItem value="m">M</ToggleGroupItem>
                                <ToggleGroupItem value="l">L</ToggleGroupItem>
                              </ToggleGroup>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="justify-center border-t p-4">
                      <Button size="sm" variant="ghost" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Variant
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="status">Status</Label>
                          <Select>
                            <SelectTrigger id="status" aria-label="Select status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Active</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Product Images</CardTitle>
                      <CardDescription>
                        Lipsum dolor sit amet, consectetur adipiscing elit
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <Image
                          alt="Product image"
                          className="aspect-square w-full rounded-md object-cover"
                          height="300"
                          src="/placeholder.svg"
                          width="300"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <button>
                            <Image
                              alt="Product image"
                              className="aspect-square w-full rounded-md object-cover"
                              height="84"
                              src="/placeholder.svg"
                              width="84"
                            />
                          </button>
                          <button>
                            <Image
                              alt="Product image"
                              className="aspect-square w-full rounded-md object-cover"
                              height="84"
                              src="/placeholder.svg"
                              width="84"
                            />
                          </button>
                          <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Upload</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Archive Product</CardTitle>
                      <CardDescription>
                        Lipsum dolor sit amet, consectetur adipiscing elit.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div></div>
                      <Button size="sm" variant="secondary">
                        Archive Product
                      </Button>
                    </CardContent>
                  </Card> */}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:hidden">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button size="sm" disabled={isPending}>
                  {isPending && <Loader className="size-4" />}
                  {isPending ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  )
}
