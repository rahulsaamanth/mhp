import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import * as relations from "./relations"

// Connection pool configuration
const connectionPool = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
})

export const db = drizzle(connectionPool, {
  schema: { ...schema, ...relations },
})

// Export the pool to be able to end the connection
export const sql = connectionPool

// // actions.ts (Server Action)
// 'use server'

// import { db } from '@/lib/db'
// import { product } from '@/lib/db/schema'
// import { z } from 'zod'

// // Validation schema
// const ProductSchema = z.object({
//   name: z.string().min(2, "Product name must be at least 2 characters"),
//   price: z.number().positive("Price must be a positive number"),
//   description: z.string().optional(),
//   categoryId: z.string(),
//   manufacturerId: z.string()
// })

// export async function createProduct(data: z.infer<typeof ProductSchema>) {
//   try {
//     // Validate input
//     const validatedData = ProductSchema.parse(data)

//     // Insert product into database
//     const newProduct = await db.insert(product).values({
//       ...validatedData,
//       id: crypto.randomUUID(), // Generate unique ID
//       createdAt: new Date()
//     }).returning()

//     return {
//       success: true,
//       product: newProduct[0]
//     }
//   } catch (error) {
//     console.error("Error creating product:", error)

//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         error: error.errors.map(err => err.message)
//       }
//     }

//     return {
//       success: false,
//       error: "Failed to create product"
//     }
//   }
// }

// // Client Component
// 'use client'

// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { createProduct } from '@/actions/products'
// import { useState } from 'react'

// export function AddProductForm() {
//   const queryClient = useQueryClient()
//   const [formData, setFormData] = useState({
//     name: '',
//     price: 0,
//     description: '',
//     categoryId: '',
//     manufacturerId: ''
//   })

//   // Mutation hook
//   const {
//     mutate,
//     isPending,
//     isError,
//     error,
//     isSuccess
//   } = useMutation({
//     // Mutation function
//     mutationFn: createProduct,

//     // Success handler
//     onSuccess: (data) => {
//       if (data.success) {
//         // Invalidate and refetch products list
//         queryClient.invalidateQueries({ queryKey: ['products'] })

//         // Reset form or show success message
//         setFormData({
//           name: '',
//           price: 0,
//           description: '',
//           categoryId: '',
//           manufacturerId: ''
//         })
//       }
//     },

//     // Error handler
//     onError: (error) => {
//       console.error("Mutation error:", error)
//     }
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // Trigger mutation
//     mutate(formData)
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         value={formData.name}
//         onChange={(e) => setFormData({...formData, name: e.target.value})}
//         placeholder="Product Name"
//         required
//       />
//       <input
//         type="number"
//         value={formData.price}
//         onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
//         placeholder="Price"
//         required
//       />
//       <textarea
//         value={formData.description}
//         onChange={(e) => setFormData({...formData, description: e.target.value})}
//         placeholder="Description"
//       />
//       <select
//         value={formData.categoryId}
//         onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
//         required
//       >
//         {/* Populate with category options */}
//       </select>
//       <select
//         value={formData.manufacturerId}
//         onChange={(e) => setFormData({...formData, manufacturerId: e.target.value})}
//         required
//       >
//         {/* Populate with manufacturer options */}
//       </select>

//       <button type="submit" disabled={isPending}>
//         {isPending ? 'Adding...' : 'Add Product'}
//       </button>

//       {isError && <div>Error: {error.message}</div>}
//       {isSuccess && <div>Product added successfully!</div>}
//     </form>
//   )
// }
