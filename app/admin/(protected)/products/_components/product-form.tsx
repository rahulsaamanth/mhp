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
import { ProductCreateInput, createProductSchema } from "@/schemas"
import { useRouter } from "next/navigation"
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn, generateSKU, generateVariantName } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Manufacturer,
  Tag,
  potency,
  productForm,
  unitOfMeasure,
} from "@rahulsaamanth/mhp-schema"
import { useMutation } from "@tanstack/react-query"
import React from "react"
import { toast } from "sonner"
import {
  FullProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
} from "../_lib/actions"
import { MultiSelectInput } from "./multi-select-input"
import { VariantImageUpload } from "./variant-image-upload"

type FormattedCategory = {
  id: string
  name: string
  parentId: string | null
  formattedName: string
}

type ProductsFormProps = {
  props: {
    categories: FormattedCategory[]
    manufacturers: Manufacturer[]
    tags: Tag[]
  }
  mode?: "create" | "edit"
  productData?: FullProduct
}

export const ProductsForm = ({
  props,
  mode = "create",
  productData,
}: ProductsFormProps) => {
  const router = useRouter()

  const { categories, manufacturers, tags } = props

  const defaultValues = {
    name: productData?.name ?? "",
    description: productData?.description ?? "",
    categoryId: productData?.categoryId ?? "",
    manufacturerId: productData?.manufacturerId ?? "",
    tags: productData?.tags ?? [],
    status: productData?.status ?? ("ACTIVE" as const),
    form: productData?.form ?? ("NONE" as const),
    unit: productData?.unit ?? ("NONE" as const),
    hsnCode: productData?.hsnCode ?? "30049014",
    isFeatured: productData?.isFeatured ?? false,
    tax: productData?.tax ?? 5,
    taxInclusive: true,
    variants: productData?.variants.map((v) => ({
      id: v.id,
      potency: v.potency,
      packSize: v.packSize ?? 0,
      costPrice: v.costPrice ?? 0,
      mrp: v.mrp,
      sellingPrice: v.sellingPrice,
      sku: v.sku,
      variantName: v.variantName,
      discount: v.discount ?? 0,
      discountType: v.discountType ?? "PERCENTAGE",
      priceAfterTax: 0,
      stock_MANG1: v.stockByLocation[0]?.stock ?? 0,
      stock_MANG2: v.stockByLocation[1]?.stock ?? 0,
      stock_KERALA1: v.stockByLocation[2]?.stock ?? 0,
      variantImage: v.variantImage ?? [],
    })) ?? [
      {
        potency: "NONE" as const,
        packSize: 0 as number,
        costPrice: 0,
        mrp: 0,
        sellingPrice: 0,
        sku: "",
        variantName: "",
        discount: 0,
        discountType: "PERCENTAGE",
        priceAfterTax: 0,
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
    form.setValue("tags", defaultValues.tags)

    form.setValue("variants", defaultValues.variants)
  }

  const { mutate: server_handleProduct, isPending } = useMutation({
    mutationFn:
      mode === "edit"
        ? (data: z.infer<typeof createProductSchema>) =>
            updateProduct(productData?.id as string, data)
        : createProduct,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          mode === "edit"
            ? "Product updated successfully"
            : "Product created successfully"
        )

        if (mode === "edit") router.push("/admin/products")
        else resetForm()
      }
      if ("error" in data && data.error) toast.error(data.error)
    },
    onError: (error) => {
      toast.error("Something went wrong!")
      console.error(
        mode === "edit" ? "Error updating prodcut:" : "Error creating product:",
        error
      )
    },
  })

  const onSubmit = async (data: z.infer<typeof createProductSchema>) => {
    try {
      const _variants = []
      const manufacturerName = manufacturers.find(
        (man) => man.id === data.manufacturerId
      )?.name

      for (const variant of data.variants) {
        const sku = generateSKU({
          productManufacturer: manufacturerName ?? "",
          productName: data.name,
          packSize: variant.packSize.toString(),
          potency: variant.potency.toString(),
        })

        const variantName = generateVariantName({
          productName: data.name,
          packSize: variant.packSize.toString(),
          potency: variant.potency.toString(),
        })

        if (mode === "edit" && typeof variant.variantImage[0] === "string") {
          _variants.push({ ...variant, id: variant.id, sku, variantName })
          continue
        }

        if (!variant.variantImage?.length) {
          _variants.push({ ...variant, id: variant.id, sku, variantName })
          continue
        }

        const generateFileName = (index: number) => `${sku}-${index + 1}`

        const uploadedUrls = await Promise.all(
          variant.variantImage.map(async (file: File, idx: number) => {
            const fileName = generateFileName(idx)
            const base64String = await new Promise<string>(
              (resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                  const base64 = reader.result as string
                  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                  const base64Data = base64.split(",")[1] || ""
                  resolve(base64Data)
                }
                reader.onerror = reject
                reader.readAsDataURL(file)
              }
            )

            const fileUrl = await uploadProductImage(
              base64String,
              fileName,
              file.type
            )
            return fileUrl
          })
        )

        _variants.push({
          ...variant,
          id: variant.id,
          sku,
          variantName,
          variantImage: uploadedUrls.filter(
            (url): url is string => url !== null
          ),
        })
      }

      const _data: ProductCreateInput = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        manufacturerId: data.manufacturerId,
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        form: data.form,
        unit: data.unit,
        hsnCode: data.hsnCode,
        tax: data.tax,
        variants: _variants,
      }

      server_handleProduct(_data)
    } catch (error) {
      console.error(error)
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
                {mode === "edit" ? "Edit Product" : "Add Product"}
              </h1>
              <Badge variant="default" className="ml-auto sm:ml-0">
                {mode === "edit" ? productData?.id : "New"}
              </Badge>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                {mode === "create" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => resetForm()}
                  >
                    Reset
                  </Button>
                ) : null}

                <Button size="sm" disabled={isPending} type="submit">
                  {isPending && <Loader className="size-4 mr-2 animate-spin" />}
                  {mode === "edit" ? "Update Product" : "Save Product"}
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
                                  value={field.value}
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
                                value={field.value}
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
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Featured Product</FormLabel>
                              <FormDescription className="text-xs">
                                Display this product on the featured section
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
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
                      <div className="flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name="tax"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Select tax slab</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(val) =>
                                    form.setValue("tax", Number(val))
                                  }
                                  value={field.value.toString()}
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
                        <FormField
                          control={form.control}
                          name="taxInclusive"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center space-x-2 mt-8">
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                  <Label htmlFor="tax-inclusive">
                                    Tax Inclusive
                                  </Label>
                                </div>
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
            </div>
          </div>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Add atleast one product variant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="space-x-4">
                        <TableHead className="w-[40px] whitespace-nowrap">
                          No.
                        </TableHead>
                        <TableHead className="w-[60px]">
                          <span className="hidden md:inline">Potency</span>
                          <span className="md:hidden">Pot.</span>
                        </TableHead>
                        <TableHead className="w-[60px]">Size</TableHead>
                        <TableHead className=" w-[60px]">Stock@M1</TableHead>
                        <TableHead className=" w-[60px]">Stock@M2</TableHead>
                        <TableHead className=" w-[60px]">Stock@K1</TableHead>
                        <TableHead className=" w-[60px]">Cost</TableHead>
                        <TableHead className="w-[60px]">Base ₹</TableHead>
                        <TableHead className="w-[60px]">₹ After Tax</TableHead>
                        <TableHead className="w-[80px]">Disc.</TableHead>
                        <TableHead className="w-[60px]">
                          <span className="hidden md:inline">Disc.Type</span>
                          <span className="md:hidden">Type</span>
                        </TableHead>
                        <TableHead className="w-[60px]">Sell ₹</TableHead>
                        <TableHead className="w-[120px] pl-4">Images</TableHead>
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
                </div>
              </div>
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
                    mrp: 0,
                    sku: "",
                    variantName: "",
                    discount: 0,
                    discountType: "PERCENTAGE",
                    // priceCalcMode: "BACKWARD",
                    priceAfterTax: 0,
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
            {mode === "create" ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => resetForm()}
              >
                Reset
              </Button>
            ) : null}
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
    const calculatePrice = () => {
      const variant = form.getValues(`variants.${index}`)
      const tax = form.getValues("tax")
      const taxInclusive = form.getValues("taxInclusive")

      if (!variant.mrp) return

      let basePrice = variant.mrp

      const priceAfterTax = taxInclusive
        ? basePrice
        : basePrice * (1 + tax / 100)

      form.setValue(
        `variants.${index}.priceAfterTax`,
        Number(priceAfterTax.toFixed(2))
      )
      // Calculate price after applying discount
      let calculatedPrice = basePrice
      if (variant.discount) {
        const discountAmount =
          variant.discountType === "PERCENTAGE"
            ? (calculatedPrice * variant.discount) / 100
            : variant.discount
        calculatedPrice -= discountAmount
      }

      // Set selling price
      let sellingPrice = calculatedPrice

      // Only apply tax if tax is not included (toggle is off)
      if (!taxInclusive) {
        sellingPrice = calculatedPrice * (1 + tax / 100)
      }

      // Update selling price if changed
      const currentSellingPrice = form.getValues(
        `variants.${index}.sellingPrice`
      )
      if (Math.abs(sellingPrice - currentSellingPrice) > 0.01) {
        form.setValue(
          `variants.${index}.sellingPrice`,
          Number(sellingPrice.toFixed(2))
        )
      }
    }

    calculatePrice()
  }, [
    form.watch(`variants.${index}.mrp`),
    form.watch(`variants.${index}.discount`),
    form.watch(`variants.${index}.discountType`),
    form.watch("tax"),
    form.watch("taxInclusive"),
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
                  <SelectTrigger className="w-full">
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[40px] px-2 text-sm"
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[40px] px-2 text-sm"
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[40px] px-2 text-sm"
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[40px] px-2 text-sm"
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[40px] px-2 text-sm"
                  placeholder="100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      {/* <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.priceCalcMode`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue="BACKWARD"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FORWARD">Base → Selling</SelectItem>
                    <SelectItem value="BACKWARD">Base ← Selling</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell> */}

      <TableCell>
        <FormField
          control={form.control}
          name={`variants.${index}.mrp`}
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
                  className={cn(
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    "w-full min-w-[40px] px-2 text-sm"
                  )}
                  placeholder="180"
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
          name={`variants.${index}.priceAfterTax`}
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
                  disabled={true}
                  className={cn(
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    "w-full min-w-[40px] px-2 text-sm bg-muted"
                  )}
                  placeholder="180"
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
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-[20px] px-2 text-sm"
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
                    <SelectItem value="FIXED">RS.</SelectItem>
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
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : e.target.valueAsNumber
                    field.onChange(value)
                  }}
                  className={cn(
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    "w-full min-w-[40px] px-2 text-sm"
                  )}
                  placeholder="150"
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
