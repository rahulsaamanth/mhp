"use client"

import { ChevronLeft, Loader, PlusCircle, X } from "lucide-react"

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

import {
  Manufacturer,
  Tag,
  potency,
  productForm,
  skuLocation,
  unitOfMeasure,
} from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import crypto from "crypto"
import { toast } from "sonner"
import { createProduct, uploadProductImage } from "../_lib/actions"
import { MultiSelectInput } from "./multi-select-input"
import { VariantImageUpload } from "./variant-image-upload"
import React from "react"

type FormattedCategory = {
  id: string
  name: string
  parentId: string | null
  formattedName: string
}

export const ProductsNewForm = ({
  props,
}: {
  props: {
    categories: FormattedCategory[]
    manufacturers: Manufacturer[]
    tags: Tag[]
  }
}) => {
  const router = useRouter()

  const { categories, manufacturers, tags } = props

  const defaultValues = {
    name: "",
    description: "",
    categoryId: "",
    manufacturerId: "",
    tags: [],
    status: "ACTIVE" as const,
    form: "NONE" as const,
    unit: "NONE" as const,
    hsnCode: "30049014",
    tax: 5,
    variants: [
      {
        potency: "NONE" as const,
        packSize: 0,
        costPrice: 0,
        basePrice: 0,
        sellingPrice: 0,
        discount: 0,
        discountType: "PERCENTAGE" as const,
        stock_MANG1: 0,
        stock_MANG2: 0,
        stock_KERALA1: 0,
        variantImage: [],
      },
    ],
  }

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
    mode: "onChange",
  })
  const { enumValues: productForms } = productForm
  const { enumValues: productUnits } = unitOfMeasure

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  function resetForm() {
    form.reset()
    form.setValue("description", "")
    form.setValue("categoryId", defaultValues.categoryId)
    form.setValue("manufacturerId", defaultValues.manufacturerId)
    form.setValue("form", defaultValues.form)
    form.setValue("unit", defaultValues.unit)
    form.setValue("status", defaultValues.status)
    form.setValue("tax", defaultValues.tax)

    form.setValue("variants", defaultValues.variants)
  }

  const { mutate: server_addProduct, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Product created successfully!")

        resetForm()
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

      const _variants = []
      for (const variant of data.variants) {
        if (!variant.variantImage?.length) {
          _variants.push(variant)
          continue
        }

        const uploadedUrls = await Promise.all(
          variant.variantImage.map((file: File) =>
            uploadProductImage({ file, fileName: generateFileName() })
          )
        )

        _variants.push({
          ...variant,
          variantImage: uploadedUrls.filter(
            (url): url is string => url !== null
          ),
        })
      }

      server_addProduct({
        ...data,
        variants: _variants,
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
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => resetForm()}
                >
                  Reset
                </Button>
                <Button size="sm" disabled={isPending} type="submit">
                  {isPending && <Loader className="size-4 mr-2 animate-spin" />}
                  Save Product
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card className="py-3">
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
                <Card className="py-4">
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
              <div className="grid auto-rows-max items-start gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Tags</CardTitle>
                    <CardDescription>
                      Add tags to help categorize your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MultiSelectInput
                              options={tags.map((tag) => tag.name)}
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

                <Card>
                  <CardHeader>
                    <CardTitle>Taxation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="hsnCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HSN Code</FormLabel>
                            <FormControl>
                              <Input
                                defaultValue="30049014"
                                onChange={field.onChange}
                                placeholder="30049014"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select tax slab</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(val) =>
                                  form.setValue("tax", Number(val))
                                }
                                defaultValue="5"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax slab" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="12">12</SelectItem>
                                  <SelectItem value="18">18</SelectItem>
                                  <SelectItem value="28">28</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
              <Table className="overflow-x-scroll w-auto md:w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20px] cursor-default">
                      <span className="truncate" title="Serial Number">
                        S.No
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Potency">
                        Potency
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Pack Size">
                        Size
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Stock at Mangalore-01">
                        Stock@MANG-01
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Stock at Mangalore-02">
                        Stock@MANG-02
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Stock at Kerala-01">
                        Stock@KERALA-01
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Cost Price">
                        C.Price(optional)
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Selling Price">
                        Base Price
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Discounted Price">
                        Discount
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Discounted Price">
                        DiscountType
                      </span>
                    </TableHead>
                    <TableHead className="w-[80px] cursor-default">
                      <span className="truncate" title="Discounted Price">
                        sellingPrice
                      </span>
                    </TableHead>
                    <TableHead className="w-[160px] cursor-default">
                      <span className="truncate" title="Variant Images">
                        Images
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <VariantFields
                      key={field.id}
                      form={form}
                      index={index}
                      onRemove={() => remove(index)}
                      isOnly={fields.length === 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
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
                    basePrice: 0,
                    discount: 0,
                    discountType: "PERCENTAGE",
                    stock_MANG1: 0,
                    stock_MANG2: 0,
                    stock_KERALA1: 0,
                    variantImage: [],
                  })
                }
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Variant
              </Button>
            </CardFooter>
          </Card>
          <div className="flex items-center justify-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => resetForm()}
            >
              Reset
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
  onRemove: () => void
  isOnly: boolean
}

const VariantFields = ({
  form,
  index,
  onRemove,
  isOnly,
}: VariantFieldsProps) => {
  const { enumValues: potencies } = potency
  const fIndex = (index + 1).toString().padStart(2, "0")

  React.useEffect(() => {
    const variant = form.getValues(`variants.${index}`)
    const tax = form.getValues("tax")

    const basePrice = variant.basePrice

    const discountAmount =
      variant.discountType === "PERCENTAGE"
        ? (basePrice * variant.discount) / 100
        : variant.discount

    const priceAfterDiscount = basePrice - discountAmount

    const taxAmount = (priceAfterDiscount * tax) / 100

    const finalPrice = priceAfterDiscount + taxAmount

    form.setValue(
      `variants.${index}.sellingPrice`,
      Number(finalPrice.toFixed(2))
    )
  }, [
    form.watch(`variants.${index}.basePrice`),
    form.watch(`variants.${index}.discount`),
    form.watch(`variants.${index}.discountType`),
    form.watch("tax"),
    index,
    form,
  ])

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
          name={`variants.${index}.stock_MANG1`}
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
                  placeholder="20"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          name={`variants.${index}.stock_MANG2`}
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
                  placeholder="20"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          name={`variants.${index}.stock_KERALA1`}
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
                  placeholder="20"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  placeholder="100"
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
          name={`variants.${index}.basePrice`}
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
                  placeholder="150"
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
          name={`variants.${index}.discount`}
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
                  placeholder="10"
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
          name={`variants.${index}.discountType`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue="PERCENTAGE"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                    <SelectItem value="RUPPEES">RS.</SelectItem>
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
          name={`variants.${index}.sellingPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="flex justify-between">
        <FormField
          control={form.control}
          name={`variants.${index}.variantImage`}
          render={({ field }) => (
            <VariantImageUpload field={field} index={index} />
          )}
        />
        <div>
          {!isOnly && (
            <Button
              onClick={onRemove}
              variant="secondary"
              size="sm"
              className="text-destructive"
            >
              <X className="size-4" />
              <span className="sr-only">Remove variant {fIndex}</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
