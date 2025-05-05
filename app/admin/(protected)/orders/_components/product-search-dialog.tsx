"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader, Search, ChevronDown, ChevronUp } from "lucide-react"

interface ProductVariant {
  id: string
  variantName?: string
  potency?: string
  packSize?: number
  sellingPrice: number
  mrp: number
  taxAmount?: number
  variantImage?: string[]
  sku?: string
  stock?: number
}

interface Product {
  id: string
  name: string
  sku?: string
  variants?: ProductVariant[]
  categoryId?: string
  categoryName?: string
  manufacturerId?: string
  manufacturerName?: string
}

interface SelectedProduct {
  productVariantId: string
  quantity: number
  unitPrice: number
  originalPrice: number
  discountAmount: number
  taxAmount: number
  productName: string
  variantName: string
  potency: string
  packSize: number
  imageUrl: string | null
}

interface ProductSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSelect: (product: SelectedProduct) => void
}

export function ProductSearchDialog({
  open,
  onOpenChange,
  onProductSelect,
}: ProductSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set()
  )
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setProducts([])
      setExpandedProductIds(new Set())
    }
  }, [open])

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Set a new timeout to debounce the API call
    searchTimeout.current = setTimeout(() => {
      if (query.length >= 3) {
        fetchProducts(query)
      } else {
        setProducts([])
      }
    }, 300)
  }

  const fetchProducts = async (query: string) => {
    if (query.length < 3) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&pageSize=20`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()

      // Format products
      setProducts(
        data.data.map((product: any) => ({
          ...product,
          variants: [], // Variants will be loaded on-demand when expanding
        }))
      )
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProductVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product variants")
      }
      const data = await response.json()

      // Update products with variants
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, variants: data.variants || [] }
            : product
        )
      )
    } catch (error) {
      console.error("Error fetching product variants:", error)
    }
  }

  const toggleProductExpand = (productId: string) => {
    const newExpandedIds = new Set(expandedProductIds)

    if (newExpandedIds.has(productId)) {
      newExpandedIds.delete(productId)
    } else {
      newExpandedIds.add(productId)
      fetchProductVariants(productId)
    }

    setExpandedProductIds(newExpandedIds)
  }

  const handleProductSelect = (product: Product, variant: ProductVariant) => {
    const selectedProduct: SelectedProduct = {
      productVariantId: variant.id,
      quantity: 1,
      unitPrice: variant.sellingPrice || 0,
      originalPrice: variant.mrp || 0,
      discountAmount: (variant.mrp || 0) - (variant.sellingPrice || 0),
      taxAmount: variant.taxAmount || 0,
      productName: product.name,
      variantName: variant.variantName || "Default",
      potency: variant.potency || "",
      packSize: variant.packSize || 0,
      imageUrl: variant.variantImage?.[0] || null,
    }

    // Add product to order and close dialog
    onProductSelect(selectedProduct)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>

        <div className="flex items-center mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type at least 3 characters to search products..."
            className="pl-9"
            autoFocus
          />
          {isLoading && (
            <Loader className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}

          {searchQuery.length >= 3 && products.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found. Try a different search term.
            </div>
          )}

          {products.length > 0 && (
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="p-0">
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted"
                    onClick={() => toggleProductExpand(product.id)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedProductIds.has(product.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedProductIds.has(product.id) && (
                    <div className="pl-6 pr-3 pb-3 space-y-2">
                      {!product.variants || product.variants.length === 0 ? (
                        <div className="text-sm py-2 px-3 italic text-muted-foreground">
                          Loading variants...
                        </div>
                      ) : (
                        product.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex justify-between items-center p-2 text-sm border rounded-md cursor-pointer hover:bg-accent"
                            onClick={() =>
                              handleProductSelect(product, variant)
                            }
                          >
                            <div>
                              <span>
                                {variant.variantName || "Default"}
                                {variant.potency && variant.potency !== "NONE"
                                  ? ` - ${variant.potency}`
                                  : ""}
                                {variant.packSize
                                  ? ` - Pack: ${variant.packSize}`
                                  : ""}
                              </span>
                              {variant.stock !== undefined && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Stock: {variant.stock})
                                </span>
                              )}
                            </div>
                            <div className="font-medium">
                              ₹{variant.sellingPrice || 0}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
