"use client"

import { ChevronLeft, Loader, PlusCircle } from "lucide-react"

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

import Tiptap from "@/components/editor"
import { createProductSchema } from "@/schemas"
import { useRouter } from "next/navigation"
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { potency, productForm, skuLocation, unitOfMeasure } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { createProduct, uploadProductImage } from "../_lib/actions"
import { VariantImageUpload } from "./variant-image-upload"
import crypto from "crypto"
import { MultiSelectInput } from "./multi-select-input"

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
      form: "NONE",
      unit: "NONE",
      skuLocation: "MANGALORE-01",
      variants: [
        {
          potency: "NONE",
          packSize: 0,
          costPrice: 100,
          sellingPrice: 150,
          discountedPrice: 140,
          stock: 20,
          variantImage: [],
        },
      ],
    },
    mode: "onChange",
  })
  const { enumValues: productForms } = productForm
  const { enumValues: productUnits } = unitOfMeasure
  const { enumValues: locations } = skuLocation

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const { mutate: server_addProduct, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product created successfully!")
        console.log(data.product)
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

  const onSubmit = async (data: z.infer<typeof createProductSchema>) => {
    try {
      const generateFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex")

      const variantsWithImages = await Promise.all(
        data.variants.map(async (variant) => {
          if (!variant.variantImage?.length) return variant

          const fileName = generateFileName()

          const uploadedUrls = await Promise.all(
            variant.variantImage.map((file: File) =>
              uploadProductImage({ file, fileName })
            )
          )

          return {
            ...variant,
            variantImage: uploadedUrls.filter(
              (url): url is string => url !== null
            ),
          }
        })
      )

      server_addProduct({
        ...data,
        variants: variantsWithImages,
      })
    } catch (error) {
      console.error("form submission failed", error)
      toast.error("Failed to submit form")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
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
                                    <SelectItem value="ACTIVE">
                                      Active
                                    </SelectItem>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Product Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="skuLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={"MANGALORE-01"}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {locations.map((loc, idx) => (
                                      <SelectItem key={idx} value={loc}>
                                        {loc}
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
                    <CardTitle>Product Tags</CardTitle>
                    <CardDescription>
                      Add tags to help categorize your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormControl>
                            <MultiSelectInput
                              options={[
                                "Tablet",
                                "Capsule",
                                "Liquid",
                                "Injection",
                                "Syrup",
                                "Cream",
                                "Powder",
                                "Gel",
                                "Spray",
                                "test1",
                                "test2",
                                "test3",
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Search product tags..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Add atleast one product variant</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Serial Number">
                        S.No
                      </span>
                    </TableHead>
                    <TableHead className="w-[100px] cursor-default">
                      <span className="truncate" title="Potency">
                        Potency
                      </span>
                    </TableHead>
                    <TableHead className="w-[100px] cursor-default">
                      <span className="truncate" title="Pack Size">
                        Size
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Stock">
                        Stock
                      </span>
                    </TableHead>
                    <TableHead className="w-[100px] cursor-default">
                      <span className="truncate" title="Cost Price">
                        C.Price
                      </span>
                    </TableHead>
                    <TableHead className="w-[100px] cursor-default">
                      <span className="truncate" title="Selling Price">
                        S.Price
                      </span>
                    </TableHead>
                    <TableHead className="w-[100px] cursor-default">
                      <span className="truncate" title="Discounted Price">
                        D.Price
                      </span>
                    </TableHead>
                    <TableHead className="w-[200px] cursor-default">
                      <span className="truncate" title="Variant Images">
                        Images
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <VariantFields key={field.id} form={form} index={index} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t p-4">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                type="button"
                onClick={() =>
                  append({
                    potency: "NONE",
                    packSize: 0,
                    costPrice: 0,
                    sellingPrice: 0,
                    discountedPrice: 0,
                    stock: 0,
                    variantImage: [],
                  })
                }
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Variant
              </Button>
              {fields.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  type="button"
                  onClick={() => remove(fields.length - 1)}
                >
                  Remove Last Variant
                </Button>
              )}
            </CardFooter>
          </Card>
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

type FormData = z.infer<typeof createProductSchema>

type VariantFieldsProps = {
  form: UseFormReturn<FormData>
  index: number
}

const VariantFields = ({ form, index }: VariantFieldsProps) => {
  const { enumValues: potencies } = potency

  const fIndex = (index + 1).toString().padStart(2, "0")

  return (
    <TableRow>
      <TableCell className="font-medium">{fIndex}</TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.potency`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select potency" />
                  </SelectTrigger>
                  <SelectContent>
                    {potencies.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.packSize`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.stock`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.costPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.sellingPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.discountedPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.variantImage`}
          render={({ field }) => (
            <VariantImageUpload field={field} index={index} />
          )}
        />
      </TableCell>
    </TableRow>
  )
}
