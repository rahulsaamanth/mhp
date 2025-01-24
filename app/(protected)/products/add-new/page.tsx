"use client"

import { createProduct } from "@/actions/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { toast } from "sonner"

const AddNewProductPage = () => {
  // const [isLoading, setIsLoading] = useState(false)
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

  const {
    mutate: server_addProduct,
    data,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: createProduct,
  })

  if (isSuccess) toast.success("Product created successfully!")
  console.log(data)

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            server_addProduct(formData)
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isPending}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isPending}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category ID
              </label>
              <Input
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                disabled={isPending}
                placeholder="Enter category ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Manufacturer ID
              </label>
              <Input
                required
                value={formData.manufacturerId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    manufacturerId: e.target.value,
                  }))
                }
                disabled={isPending}
                placeholder="Enter manufacturer ID"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default AddNewProductPage
