// File: /app/admin/(protected)/orders/_components/order-form.tsx
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
import React, { useEffect } from "react"
import { toast } from "sonner"
import { createOrderSchema } from "@/schemas"
import { Checkbox } from "@/components/ui/checkbox"

import { Textarea } from "@/components/ui/textarea"

// You'll need to create these action functions
import { createOrder, updateOrder } from "../_lib/actions"
import { DatePicker } from "@/components/date-picker"

// Define the props for the product search component
type ProductSearchProps = {
  onProductSelect: (product: any) => void
}

// Simple product search component (you'll need to implement this)
const ProductSearch = ({ onProductSelect }: ProductSearchProps) => {
  // Implement product search functionality
  return (
    <div className="flex gap-2">
      <Input placeholder="Search products..." className="flex-1" />
      <Button variant="outline" type="button">
        Search
      </Button>
    </div>
  )
}

type OrderFormProps = {
  props: {
    stores: Store[]
    users?: any[] // Replace with your user type
    products?: any[] // Replace with your product type
  }
  mode?: "create" | "edit"
  orderData?: any // Replace with your order type
}

export const OrderForm = ({
  props,
  mode = "create",
  orderData,
}: OrderFormProps) => {
  const router = useRouter()
  const { stores, users = [], products = [] } = props

  // Default values for the form
  const defaultValues = {
    userId: orderData?.userId ?? "",
    customerName: orderData?.customerName ?? "",
    customerPhone: orderData?.customerPhone ?? "",
    customerEmail: orderData?.customerEmail ?? "",
    isGuestOrder: orderData?.isGuestOrder ?? false,
    storeId: orderData?.storeId ?? "",
    orderType: orderData?.orderType ?? "OFFLINE",
    orderItems: orderData?.orderItems ?? [
      {
        productVariantId: "",
        quantity: 1,
        unitPrice: 0,
        originalPrice: 0,
        discountAmount: 0,
        taxAmount: 0,
      },
    ],
    subtotal: orderData?.subtotal ?? 0,
    shippingCost: orderData?.shippingCost ?? 0,
    discount: orderData?.discount ?? 0,
    tax: orderData?.tax ?? 0,
    totalAmountPaid: orderData?.totalAmountPaid ?? 0,
    deliveryStatus: orderData?.deliveryStatus ?? "PROCESSING",
    paymentStatus: orderData?.paymentStatus ?? "PENDING",
    paymentMethodId: orderData?.paymentMethodId ?? "",
    paymentType: orderData?.paymentType ?? "CREDIT_CARD",
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

  // Reset form function
  function resetForm() {
    form.reset()
  }

  // Handle form submission
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

  // Calculate totals when order items change
  useEffect(() => {
    const calculateTotals = () => {
      const items = form.getValues("orderItems")

      // Calculate subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      // Calculate tax
      const tax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0)

      // Get shipping and discount
      const shippingCost = form.getValues("shippingCost") || 0
      const discount = form.getValues("discount") || 0

      // Calculate total
      const total = subtotal + tax + shippingCost - discount

      // Update form values
      form.setValue("subtotal", Number(subtotal.toFixed(2)))
      form.setValue("tax", Number(tax.toFixed(2)))
      form.setValue("totalAmountPaid", Number(total.toFixed(2)))
    }

    calculateTotals()
  }, [
    form.watch("orderItems"),
    form.watch("shippingCost"),
    form.watch("discount"),
    form,
  ])

  // Copy shipping address to billing address when sameAsBilling is checked
  useEffect(() => {
    const sameAsBilling = form.getValues("sameAsBilling")
    if (sameAsBilling) {
      const shippingAddress = form.getValues("shippingAddress")
      form.setValue("billingAddress", shippingAddress)
    }
  }, [form.watch("sameAsBilling"), form.watch("shippingAddress"), form])

  const onSubmit = async (data: z.infer<typeof createOrderSchema>) => {
    try {
      // Process the data if needed
      server_handleOrder(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit form")
    }
  }

  // Handle product selection
  const handleProductSelect = (product: any, index: number) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                {/* Order Type and Store Selection */}
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

                {/* Customer Information */}
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
                          <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select User</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value)
                                      const user = users.find(
                                        (u) => u.id === value
                                      )
                                      if (user) {
                                        form.setValue(
                                          "customerName",
                                          user.name || ""
                                        )
                                        form.setValue(
                                          "customerEmail",
                                          user.email || ""
                                        )
                                        form.setValue(
                                          "customerPhone",
                                          user.phone || ""
                                        )
                                      }
                                    }}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {users.map((user) => (
                                        <SelectItem
                                          key={user.id}
                                          value={user.id}
                                        >
                                          {user.name} ({user.email})
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
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
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
                                <Input {...field} placeholder="Enter country" />
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

                {/* Billing Address - Only show if sameAsBilling is false */}
                {!form.watch("sameAsBilling") && (
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
                                  <Input {...field} placeholder="Enter city" />
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

                {/* Order Items */}
                <Card className="my-4">
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>Add products to the order</CardDescription>
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
                            {fields.map((field, index) => (
                              <OrderItemFields
                                key={field.id}
                                form={form}
                                index={index}
                                onRemove={() => remove(index)}
                                isOnly={fields.length === 1}
                                onProductSelect={(product) =>
                                  handleProductSelect(product, index)
                                }
                                products={products}
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
                          productVariantId: "",
                          quantity: 1,
                          unitPrice: 0,
                          originalPrice: 0,
                          discountAmount: 0,
                          taxAmount: 0,
                          productName: "",
                          variantName: "",
                          potency: "",
                          packSize: 0,
                        })
                      }
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Item
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Right Column - Order Summary & Status */}
              <div className="grid auto-rows-max items-start gap-4">
                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Details */}
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

                {/* Order Summary */}
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

                {/* Notes */}
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

          {/* Mobile Submit Buttons */}
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

// Order Item Fields Component
type OrderItemFieldsProps = {
  form: UseFormReturn<z.infer<typeof createOrderSchema>>
  index: number
  onRemove: () => void
  isOnly: boolean
  onProductSelect: (product: any) => void
  products: any[]
}

const OrderItemFields = ({
  form,
  index,
  onRemove,
  isOnly,
  onProductSelect,
  products,
}: OrderItemFieldsProps) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredProducts, setFilteredProducts] = React.useState<any[]>([])
  const searchRef = React.useRef<HTMLDivElement>(null)

  // Get the currently selected product details to display
  const selectedVariantId = form.watch(`orderItems.${index}.productVariantId`)
  const selectedProductName = form.watch(`orderItems.${index}.productName`)
  const selectedVariantName = form.watch(`orderItems.${index}.variantName`)
  const selectedPotency = form.watch(`orderItems.${index}.potency`)
  const selectedPackSize = form.watch(`orderItems.${index}.packSize`)

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearchOpen(true)

    if (query.length >= 2) {
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.variants.some(
            (v: any) =>
              v.sku?.toLowerCase().includes(query.toLowerCase()) ||
              v.variantName?.toLowerCase().includes(query.toLowerCase())
          )
      )
      setFilteredProducts(results)
    } else {
      setFilteredProducts([])
    }
  }

  const selectProduct = (product: any, variant: any) => {
    const selectedProduct = {
      id: variant.id,
      name: product.name,
      variantName: variant.variantName,
      potency: variant.potency,
      packSize: variant.packSize,
      sellingPrice: variant.sellingPrice || 0,
      mrp: variant.mrp || 0,
      discountAmount: (variant.mrp || 0) - (variant.sellingPrice || 0),
      taxAmount: variant.taxAmount || 0,
      variantImage: variant.variantImage?.[0] || null,
    }

    // Update all form fields with selected product data
    form.setValue(`orderItems.${index}.productVariantId`, variant.id)
    form.setValue(`orderItems.${index}.productName`, product.name)
    form.setValue(
      `orderItems.${index}.variantName`,
      variant.variantName || "Default"
    )
    form.setValue(`orderItems.${index}.potency`, variant.potency || "")
    form.setValue(`orderItems.${index}.packSize`, variant.packSize || 0)
    form.setValue(`orderItems.${index}.unitPrice`, variant.sellingPrice || 0)
    form.setValue(`orderItems.${index}.originalPrice`, variant.mrp || 0)
    form.setValue(
      `orderItems.${index}.discountAmount`,
      (variant.mrp || 0) - (variant.sellingPrice || 0)
    )
    form.setValue(`orderItems.${index}.taxAmount`, variant.taxAmount || 0)

    // Set quantity to 1 if it's currently 0
    const currentQuantity = form.getValues(`orderItems.${index}.quantity`)
    if (!currentQuantity) {
      form.setValue(`orderItems.${index}.quantity`, 1)
    }

    onProductSelect(selectedProduct)
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  const itemTotal =
    form.watch(`orderItems.${index}.unitPrice`) *
    form.watch(`orderItems.${index}.quantity`)

  return (
    <TableRow>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div className="relative" ref={searchRef}>
          <FormField
            control={form.control}
            name={`orderItems.${index}.productVariantId`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-col gap-1">
                    {selectedVariantId ? (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {selectedProductName}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              form.setValue(
                                `orderItems.${index}.productVariantId`,
                                ""
                              )
                              form.setValue(
                                `orderItems.${index}.productName`,
                                ""
                              )
                              form.setValue(
                                `orderItems.${index}.variantName`,
                                ""
                              )
                              form.setValue(`orderItems.${index}.potency`, "")
                              form.setValue(`orderItems.${index}.packSize`, 0)
                              form.setValue(`orderItems.${index}.unitPrice`, 0)
                              form.setValue(
                                `orderItems.${index}.originalPrice`,
                                0
                              )
                              form.setValue(
                                `orderItems.${index}.discountAmount`,
                                0
                              )
                              form.setValue(`orderItems.${index}.taxAmount`, 0)
                              setSearchQuery("")
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedVariantName}
                          {selectedPotency && selectedPotency !== "NONE"
                            ? ` - ${selectedPotency}`
                            : ""}
                          {selectedPackSize ? ` - ${selectedPackSize}` : ""}
                        </div>
                      </div>
                    ) : (
                      <Input
                        placeholder="Search product by name, potency or packsize..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => {
                          if (searchQuery.length >= 2) {
                            setIsSearchOpen(true)
                          }
                        }}
                      />
                    )}

                    {isSearchOpen && filteredProducts.length > 0 && (
                      <div className="absolute z-10 top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className="px-2 py-1">
                            <div className="font-medium text-sm border-b">
                              {product.name}
                            </div>
                            <div className="py-1">
                              {product.variants &&
                              product.variants.length > 0 ? (
                                product.variants.map((variant: any) => (
                                  <div
                                    key={variant.id}
                                    className="cursor-pointer text-sm py-1.5 px-2 rounded hover:bg-gray-100"
                                    onClick={() =>
                                      selectProduct(product, variant)
                                    }
                                  >
                                    <div className="flex justify-between">
                                      <span>
                                        {variant.variantName || "Default"}
                                        {variant.potency &&
                                        variant.potency !== "NONE"
                                          ? ` - ${variant.potency}`
                                          : ""}
                                        {variant.packSize
                                          ? ` - Pack: ${variant.packSize}`
                                          : ""}
                                      </span>
                                      <span className="font-medium">
                                        ₹{variant.sellingPrice || 0}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-muted-foreground p-1">
                                  No variants available
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearchOpen &&
                      searchQuery.length >= 2 &&
                      filteredProducts.length === 0 && (
                        <div className="absolute z-10 top-full left-0 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5">
                          <p className="text-sm text-muted-foreground">
                            No products found. Try a different search term.
                          </p>
                        </div>
                      )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        {!isOnly && (
          <Button variant="ghost" size="icon" onClick={onRemove} type="button">
            <X className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
