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

import { createProduct } from "../_lib/actions"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { productForm, unitOfMeasure } from "@/db/schema"

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

export const ProductsNewForm = ({
  props,
}: {
  props: {
    categories: FormattedCategory[]
    manufacturers: Manufacturer[]
  }
}) => {
  const router = useRouter()

  const { categories, manufacturers } = props

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      manufacturerId: "",
      tags: [],
      status: "ACTIVE",
      form: "DILUTIONS(P)",
      unit: "ML",
    },
    mode: "onChange",
  })

  const { mutate: server_addProduct, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product created successfully!")
        router.push("/products")
      } else {
        toast.error(data.error || "Failed to create product")
      }
    },
    onError: (error) => {
      toast.error("Something went wrong!")
      console.error("Error creating product:", error)
    },
  })
  const { enumValues: productForms } = productForm
  const { enumValues: productUnits } = unitOfMeasure

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data: z.infer<typeof createProductSchema>) => server_addProduct(data)
        )}
      >
        <div className="grid  flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              type="button"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Add Product
            </h1>
            <Badge variant="default" className="ml-auto sm:ml-0">
              new
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button">
                Discard
              </Button>
              <Button size="sm" disabled={isPending} type="submit">
                {isPending && <Loader className="size-4 mr-2 animate-spin" />}
                Save Product
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Enter Product Name and Description
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
                                autoComplete="off"
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
                  <CardTitle>Product Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Category</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                      className={`${category.formattedName.includes("/") && "ml-4 border-l border-dotted border-black"}`}
                                    >
                                      {category.formattedName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
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
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select manufacturer" />
                                </SelectTrigger>
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="form"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Form</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select form" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productForms.map((form, idx) => (
                                    <SelectItem key={idx} value={form}>
                                      {form}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Unit</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productUnits.map((unit, idx) => (
                                    <SelectItem key={idx} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add atleast one product variant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">S NO.</TableHead>
                        <TableHead>Potency</TableHead>
                        <TableHead>Pack Size</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Discounted Price</TableHead>
                        <TableHead className="w-[100px]">Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">001</TableCell>
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
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1"
                    type="button"
                  >
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
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={"ACTIVE"}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DRAFT">Draft</SelectItem>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="ARCHIVED">
                                    Archived
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      <button type="button">
                        <Image
                          alt="Product image"
                          className="aspect-square w-full rounded-md object-cover"
                          height="84"
                          src="/placeholder.svg"
                          width="84"
                        />
                      </button>
                      <button type="button">
                        <Image
                          alt="Product image"
                          className="aspect-square w-full rounded-md object-cover"
                          height="84"
                          src="/placeholder.svg"
                          width="84"
                        />
                      </button>
                      <button
                        type="button"
                        className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed"
                      >
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
                  <Button size="sm" variant="secondary" type="button">
                    Archive Product
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 md:hidden">
            <Button variant="outline" size="sm" type="button">
              Discard
            </Button>
            <Button size="sm" disabled={isPending} type="submit">
              {isPending && <Loader className="size-4 mr-2 animate-spin" />}
              Save Product
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
