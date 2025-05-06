"use client"

import { ChevronLeft, Loader, PlusCircle, X, Search } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  deliveryStatus,
  orderType,
  paymentStatus,
  paymentType,
  Store,
} from "@rahulsaamanth/mhp-schema"
import { useMutation } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { createOrderSchema } from "@/schemas"
import { Checkbox } from "@/components/ui/checkbox"

import { Textarea } from "@/components/ui/textarea"

import { createOrder, updateOrder } from "../_lib/actions"
import { DatePicker } from "@/components/date-picker"

import { ProductSearchDialog } from "./product-search-dialog"
import { UserSearchDialog } from "./user-search-dialog"

type OrderFormProps = {
  props: {
    stores: Store[]
    users?: any[]
    products?: any[]
    categories?: any[]
    manufacturers?: any[]
  }
  mode?: "create" | "edit"
  orderData?: any
}

export const OrderForm = ({
  props,
  mode = "create",
  orderData,
}: OrderFormProps) => {
  const router = useRouter()
  const {
    stores,
    users = [],
    products = [],
    manufacturers = [],
    categories = [],
  } = props

  const defaultValues = {
    userId: orderData?.userId ?? "",
    customerName: orderData?.customerName ?? "",
    customerPhone: orderData?.customerPhone ?? "",
    customerEmail: orderData?.customerEmail ?? "",
    isGuestOrder: orderData?.isGuestOrder ?? false,
    storeId: stores.find((store) => store.code === "MANGALORE-01")?.id ?? "",
    orderType: orderData?.orderType ?? "OFFLINE",
    orderItems: orderData?.orderItems ?? [],
    subtotal: orderData?.subtotal ?? 0,
    shippingCost: orderData?.shippingCost ?? 0,
    discount: orderData?.discount ?? 0,
    tax: orderData?.tax ?? 0,
    totalAmountPaid: orderData?.totalAmountPaid ?? 0,
    deliveryStatus: orderData?.deliveryStatus ?? "COMPLETED",
    paymentStatus: orderData?.paymentStatus ?? "PAID",
    paymentMethodId: orderData?.paymentMethodId ?? "",
    paymentType: orderData?.paymentType ?? "CASH",
    paymentIntentId: orderData?.paymentIntentId ?? "",
    shippingAddress: orderData?.shippingAddress ?? {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    billingAddress: orderData?.billingAddress ?? {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    sameAsBilling: true,
    customerNotes: orderData?.customerNotes ?? "",
    adminNotes: orderData?.adminNotes ?? "",
    estimatedDeliveryDate: orderData?.estimatedDeliveryDate
      ? new Date(orderData.estimatedDeliveryDate)
      : undefined,
  }

  const form = useForm<z.infer<typeof createOrderSchema>>({
    resolver: zodResolver(createOrderSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  })

  function resetForm() {
    form.reset()
  }

  const { mutate: server_handleOrder, isPending } = useMutation({
    mutationFn:
      mode === "edit"
        ? (data: z.infer<typeof createOrderSchema>) =>
            updateOrder(orderData?.id as string, data)
        : createOrder,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          mode === "edit"
            ? "Order updated successfully"
            : "Order created successfully"
        )

        if (mode === "edit") router.push("/admin/orders")
        else resetForm()
      }
      if ("error" in data && data.error) toast.error(data.error)
    },
    onError: (error) => {
      toast.error("Something went wrong!")
      console.error(
        mode === "edit" ? "Error updating order:" : "Error creating order:",
        error
      )
    },
  })

  useEffect(() => {
    const calculateTotals = () => {
      const items = form.getValues("orderItems")

      const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      const tax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0)

      const shippingCost =
        form.watch("orderType") === "ONLINE"
          ? form.getValues("shippingCost") || 0
          : 0
      const discount = form.getValues("discount") || 0

      const total = subtotal + tax + shippingCost - discount

      form.setValue("subtotal", Number(subtotal.toFixed(2)))
      form.setValue("tax", Number(tax.toFixed(2)))
      form.setValue("totalAmountPaid", Number(total.toFixed(2)))

      if (form.watch("orderType") === "OFFLINE") {
        form.setValue("deliveryStatus", "IN_STORE_PICKUP")
        form.setValue("shippingCost", 0)
        form.setValue("paymentType", "IN_STORE")
      }
    }

    calculateTotals()
  }, [
    form.watch("orderItems"),
    form.watch("shippingCost"),
    form.watch("discount"),
    form.watch("orderType"),
    form,
  ])

  useEffect(() => {
    const sameAsBilling = form.getValues("sameAsBilling")
    if (sameAsBilling) {
      const shippingAddress = form.getValues("shippingAddress")
      form.setValue("billingAddress", shippingAddress)
    }
  }, [form.watch("sameAsBilling"), form.watch("shippingAddress"), form])

  useEffect(() => {
    const orderItems = form.getValues("orderItems")

    if (orderItems && orderItems.length > 0) {
      const nonEmptyItems = orderItems.filter((item) => item.productVariantId)

      if (nonEmptyItems.length !== orderItems.length) {
        form.setValue("orderItems", nonEmptyItems)
      }
    }
  }, [form])

  useEffect(() => {
    const orderType = form.watch("orderType")

    if (orderType === "OFFLINE") {
      form.setValue("isGuestOrder", true)
    }
  }, [form.watch("orderType"), form])

  const onSubmit = async (data: z.infer<typeof createOrderSchema>) => {
    console.log("onSubmit function called with data:", data)
    try {
      if (
        !data.orderItems ||
        data.orderItems.length === 0 ||
        !data.orderItems[0]?.productVariantId
      ) {
        console.log("Validation failed: Missing product items")
        toast.error("Please add at least one product to the order")
        return
      }

      if (!data.storeId) {
        console.log("Validation failed: No store selected")
        toast.error("Please select a store")
        return
      }

      if (data.isGuestOrder) {
        if (!data.customerName || !data.customerPhone) {
          console.log(
            "Validation failed: Missing customer info for guest order"
          )
          toast.error("Please provide customer name and phone for guest orders")
          return
        }
      }

      console.log("All validations passed, submitting order data:", data)
      server_handleOrder(data)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form")
    }
  }

  const handleProductSelect = (product: any, index: number) => {
    if (!product.id) {
      return
    }

    form.setValue(`orderItems.${index}.productVariantId`, product.id)
    form.setValue(`orderItems.${index}.productName`, product.name)
    form.setValue(`orderItems.${index}.unitPrice`, product.sellingPrice)
    form.setValue(`orderItems.${index}.originalPrice`, product.mrp)
    form.setValue(`orderItems.${index}.taxAmount`, product.taxAmount || 0)
    form.setValue(
      `orderItems.${index}.discountAmount`,
      product.discountAmount || 0
    )
    form.setValue(`orderItems.${index}.variantName`, product.variantName || "")
    form.setValue(`orderItems.${index}.potency`, product.potency || "")
    form.setValue(`orderItems.${index}.packSize`, product.packSize || 0)
    form.setValue(
      `orderItems.${index}.imageUrl`,
      product.variantImage?.[0] || ""
    )
  }

  const [showProductSearch, setShowProductSearch] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log("Form submit event triggered")

          const validationErrors = form.formState.errors
          console.log("Form validation errors:", validationErrors)

          const formValues = form.getValues()

          if (formValues.orderType === "OFFLINE") {
            if (!formValues.shippingAddress.street) {
              form.setValue("shippingAddress", {
                street: "In-Store Purchase",
                city: "Local",
                state: "Local",
                postalCode: "000000",
                country: "India",
              })
            }

            form.setValue("billingAddress", {
              street: "In-Store Purchase",
              city: "Local",
              state: "Local",
              postalCode: "000000",
              country: "India",
            })
          }

          const updatedValues = form.getValues()
          console.log("Submitting with values:", updatedValues)
          onSubmit(updatedValues)
        }}
      >
        <div className="grid gap-4">
          <div className="grid flex-1 auto-rows-max gap-4">
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
                {mode === "edit" ? "Edit Order" : "Create Order"}
              </h1>
              {mode === "edit" && (
                <Badge variant="default" className="ml-auto sm:ml-0">
                  {orderData?.id || "New"}
                </Badge>
              )}
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
                  {mode === "edit" ? "Update Order" : "Create Order"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card className="py-3">
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                      Select order type and store
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="orderType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order Type</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select order type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="OFFLINE">
                                      Offline
                                    </SelectItem>
                                    <SelectItem value="ONLINE">
                                      Online
                                    </SelectItem>
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
                          name="storeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Store</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select store" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stores.map((store) => (
                                      <SelectItem
                                        key={store.id}
                                        value={store.id}
                                      >
                                        {store.name}
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

                <Card className="py-3">
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Enter customer details or select an existing user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="isGuestOrder"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Guest Order</FormLabel>
                              <FormDescription className="text-xs">
                                Create order for a guest customer
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

                      {!form.watch("isGuestOrder") && (
                        <div className="grid gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowUserSearch(true)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search Users
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter customer name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter phone number"
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
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter email address"
                                  type="email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <UserSearchDialog
                        open={showUserSearch}
                        onOpenChange={setShowUserSearch}
                        onUserSelect={(user) => {
                          form.setValue("userId", user.id)
                          form.setValue("customerName", user.name)
                          form.setValue("customerEmail", user.email)
                          form.setValue("customerPhone", user.phone)
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {form.watch("orderType") === "ONLINE" && (
                  <Card className="py-3">
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <FormField
                            control={form.control}
                            name="shippingAddress.street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter street address"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="shippingAddress.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="shippingAddress.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="shippingAddress.postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter postal code"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="shippingAddress.country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Enter country"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="sameAsBilling"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Use same address for billing
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!form.watch("sameAsBilling") &&
                  form.watch("orderType") === "ONLINE" && (
                    <Card className="py-3">
                      <CardHeader>
                        <CardTitle>Billing Address</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6">
                          <div className="grid gap-3">
                            <FormField
                              control={form.control}
                              name="billingAddress.street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter street address"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="billingAddress.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter city"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingAddress.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter state"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="billingAddress.postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter postal code"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingAddress.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter country"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                <Card className="my-4">
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>Add products to the order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-4">
                      <Button
                        onClick={() => setShowProductSearch(true)}
                        type="button"
                        size="sm"
                        className="gap-1"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Add Product
                      </Button>
                    </div>

                    <div className="overflow-x-auto mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="space-x-4">
                              <TableHead className="w-[40px] whitespace-nowrap">
                                No.
                              </TableHead>
                              <TableHead className="w-[200px]">
                                Product
                              </TableHead>
                              <TableHead className="w-[60px]">Qty</TableHead>
                              <TableHead className="w-[80px]">
                                Unit Price
                              </TableHead>
                              <TableHead className="w-[80px]">
                                Discount
                              </TableHead>
                              <TableHead className="w-[80px]">Tax</TableHead>
                              <TableHead className="w-[80px]">Total</TableHead>
                              <TableHead className="w-[40px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fields.length > 0 ? (
                              fields.map((field, index) => (
                                <OrderItemFields
                                  key={field.id}
                                  form={form}
                                  index={index}
                                  onRemove={() => remove(index)}
                                  isOnly={fields.length === 1}
                                />
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={8}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No products added. Click the "Add Product"
                                  button to add products to the order.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <ProductSearchDialog
                      open={showProductSearch}
                      onOpenChange={setShowProductSearch}
                      onProductSelect={(product) => {
                        append({
                          ...product,
                          imageUrl: product.imageUrl || undefined,
                        })
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid auto-rows-max items-start gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {form.watch("orderType") === "ONLINE" && (
                        <FormField
                          control={form.control}
                          name="deliveryStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Status</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deliveryStatus.enumValues.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status.replace(/_/g, " ")}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="paymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentStatus.enumValues.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("orderType") === "ONLINE" && (
                        <FormField
                          control={form.control}
                          name="estimatedDeliveryDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Estimated Delivery Date</FormLabel>
                              <DatePicker
                                date={field.value}
                                setDateAction={field.onChange}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="paymentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue="IN_STORE"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentType.enumValues.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.replace(/_/g, " ")}
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Subtotal:</span>
                        <span>₹{form.watch("subtotal").toFixed(2)}</span>
                      </div>

                      {form.watch("orderType") === "ONLINE" && (
                        <FormField
                          control={form.control}
                          name="shippingCost"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-sm">
                                  Shipping:
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ""
                                          ? 0
                                          : parseFloat(e.target.value)
                                      field.onChange(value)
                                    }}
                                    className="w-24 text-right"
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-sm">
                                Discount:
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value)
                                    field.onChange(value)
                                  }}
                                  className="w-24 text-right"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tax:</span>
                        <span>₹{form.watch("tax").toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-2 font-medium">
                        <span>Total:</span>
                        <span>₹{form.watch("totalAmountPaid").toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="customerNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter customer notes"
                                className="min-h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter admin notes"
                                className="min-h-20"
                              />
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
              {mode === "edit" ? "Update Order" : "Create Order"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

type OrderItemFieldsProps = {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>
  index: number
  onRemove: () => void
  isOnly: boolean
}

const OrderItemFields = ({
  form,
  index,
  onRemove,
  isOnly,
}: OrderItemFieldsProps) => {
  const itemTotal =
    form.watch(`orderItems.${index}.unitPrice`) *
    form.watch(`orderItems.${index}.quantity`)

  const productName = form.watch(`orderItems.${index}.productName`)
  const variantName = form.watch(`orderItems.${index}.variantName`)
  const potency = form.watch(`orderItems.${index}.potency`)
  const packSize = form.watch(`orderItems.${index}.packSize`)

  return (
    <TableRow>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div className="font-medium">{productName}</div>
        {productName && (
          <div className="flex gap-1 text-xs text-muted-foreground mt-1">
            {variantName && <span>{variantName}</span>}
            {potency && potency !== "NONE" && <span>({potency})</span>}
            {(packSize ?? 0) > 0 && <span>{packSize}</span>}
          </div>
        )}
      </TableCell>
      <TableCell>
        <FormField
          control={form.control}
          name={`orderItems.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                    field.onChange(value)
                  }}
                  className="w-16"
                  min={1}
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
          name={`orderItems.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                    field.onChange(value)
                  }}
                  className="w-20"
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
          name={`orderItems.${index}.discountAmount`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                    field.onChange(value)
                  }}
                  className="w-20"
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
          name={`orderItems.${index}.taxAmount`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                    field.onChange(value)
                  }}
                  className="w-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="font-medium">₹{itemTotal.toFixed(2)}</TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={onRemove} type="button">
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
