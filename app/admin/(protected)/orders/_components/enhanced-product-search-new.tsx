import React, { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader, X, Pin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

// Define the product and variant types
export interface ProductVariant {
  id: string
  variantName?: string
  potency?: string
  packSize?: number
  sellingPrice: number
  mrp: number
  taxAmount?: number
  discountAmount?: number
  variantImage?: string[]
  sku?: string
  stock?: number
}

export interface Product {
  id: string
  name: string
  sku?: string
  variants?: ProductVariant[]
  categoryId?: string
  categoryName?: string
  manufacturerId?: string
  manufacturerName?: string
}

export interface SelectedProduct {
  id: string
  name: string
  variantName?: string
  potency?: string
  packSize?: number
  sellingPrice: number
  mrp: number
  discountAmount: number
  taxAmount: number
  variantImage?: string | null
}

interface ProductSearchProps {
  onProductSelectAction: (product: SelectedProduct) => void
  form: UseFormReturn<any>
  fieldName?: string
  index?: number
  products?: any[]
  categories?: any[]
  manufacturers?: any[]
}

export function EnhancedProductSearch({
  onProductSelectAction,
  form,
  fieldName = "orderItems",
  index = 0,
  products = [],
  categories = [],
  manufacturers = [],
}: ProductSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [productResults, setProductResults] = useState<Product[]>([])
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set()
  )
  const [recentProducts, setRecentProducts] = useState<SelectedProduct[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Handle outside click to close dropdown
  useEffect(() => {
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

  // Load recent products from localStorage
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem("mhp-recent-products")
      if (storedRecent) {
        setRecentProducts(JSON.parse(storedRecent))
      }
    } catch (error) {
      console.error("Error loading recent products:", error)
    }
  }, [])

  // Step 1: Fetch product list based on search query
  const fetchProductList = async (query: string) => {
    if (query.length < 4) {
      setProductResults([])
      setFilteredProducts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&pageSize=20`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()

      // Store the product results without variants for now
      const products = data.data.map((product: any) => ({
        ...product,
        variants: [], // We'll fetch variants separately when a product is expanded
      }))

      setProductResults(products)
      setFilteredProducts(products)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProductResults([])
      setFilteredProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Fetch variants for a specific product when expanded
  const fetchProductVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product variants")
      }
      const data = await response.json()

      // Update the product with its variants
      setFilteredProducts((prevProducts) =>
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearchOpen(true)

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Set a new timeout to debounce the API call
    searchTimeout.current = setTimeout(() => {
      fetchProductList(query)
    }, 300) // 300ms debounce
  }

  const handleProductExpand = (productId: string) => {
    // Toggle expansion state
    const newExpandedIds = new Set(expandedProductIds)

    if (newExpandedIds.has(productId)) {
      newExpandedIds.delete(productId)
    } else {
      newExpandedIds.add(productId)
      // Fetch variants when expanding
      fetchProductVariants(productId)
    }

    setExpandedProductIds(newExpandedIds)
  }

  const selectProduct = (product: Product, variant: ProductVariant) => {
    const selectedProduct: SelectedProduct = {
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

    // Add to recent products
    const updatedRecent = [
      selectedProduct,
      ...recentProducts.filter((p) => p.id !== variant.id).slice(0, 9),
    ]
    setRecentProducts(updatedRecent)

    // Store in localStorage
    try {
      localStorage.setItem("mhp-recent-products", JSON.stringify(updatedRecent))
    } catch (e) {
      console.error("Error saving recent products:", e)
    }

    // Call the passed action handler
    onProductSelectAction(selectedProduct)
    setIsSearchOpen(false)
    setSearchQuery("")
    setExpandedProductIds(new Set())
  }

  const clearSelection = () => {
    form.setValue(`${fieldName}.${index}.productVariantId`, "")
    form.setValue(`${fieldName}.${index}.productName`, "")
    form.setValue(`${fieldName}.${index}.variantName`, "")
    form.setValue(`${fieldName}.${index}.potency`, "")
    form.setValue(`${fieldName}.${index}.packSize`, 0)
    form.setValue(`${fieldName}.${index}.unitPrice`, 0)
    form.setValue(`${fieldName}.${index}.originalPrice`, 0)
    form.setValue(`${fieldName}.${index}.discountAmount`, 0)
    form.setValue(`${fieldName}.${index}.taxAmount`, 0)
    setSearchQuery("")
  }

  // Get the currently selected product details to display
  const selectedVariantId = form.watch(`${fieldName}.${index}.productVariantId`)
  const selectedProductName = form.watch(`${fieldName}.${index}.productName`)
  const selectedVariantName = form.watch(`${fieldName}.${index}.variantName`)
  const selectedPotency = form.watch(`${fieldName}.${index}.potency`)
  const selectedPackSize = form.watch(`${fieldName}.${index}.packSize`)

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">Add Product</h3>

      <div className="relative" ref={searchRef}>
        <FormField
          control={form.control}
          name={`${fieldName}.${index}.productVariantId`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-1">
                  {selectedVariantId ? (
                    <div className="flex flex-col border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{selectedProductName}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
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
                    <div className="relative">
                      <Input
                        placeholder="Type at least 4 letters to search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => {
                          if (searchQuery.length >= 4) {
                            setIsSearchOpen(true)
                          }
                        }}
                      />
                      {isLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}

                  {isSearchOpen && filteredProducts.length > 0 && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-full max-h-[300px] overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="px-2 py-1">
                          <div
                            className="font-medium text-sm border-b p-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                            onClick={() => handleProductExpand(product.id)}
                          >
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {expandedProductIds.has(product.id) ? "▼" : "▶"}
                            </span>
                          </div>
                          {expandedProductIds.has(product.id) && (
                            <div className="py-1">
                              {product.variants &&
                              product.variants.length > 0 ? (
                                product.variants.map((variant) => (
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
                                  {isLoading
                                    ? "Loading variants..."
                                    : "No variants available"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isSearchOpen &&
                    searchQuery.length >= 4 &&
                    !isLoading &&
                    filteredProducts.length === 0 && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5">
                        <p className="text-sm text-muted-foreground">
                          No products found. Try a different search term.
                        </p>
                      </div>
                    )}

                  {isSearchOpen &&
                    searchQuery.length > 0 &&
                    searchQuery.length < 4 && (
                      <div className="absolute z-50 top-full left-0 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5">
                        <p className="text-sm text-muted-foreground">
                          Please type at least 4 characters to search.
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
    </Card>
  )
}
