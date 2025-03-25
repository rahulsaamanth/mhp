import { db } from "@/db/db"
import { product } from "@rahulsaamanth/mhp_shared-schema"
import { buildSearchCondition, buildSortCondition } from "@/db/utils"
import { and, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { productVariant } from "@rahulsaamanth/mhp_shared-schema"
import { auth } from "@/auth"
export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 10
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy")
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc"

    const offset = (page - 1) * pageSize
    const whereConditions = buildSearchCondition(search)
    const orderByCondition = buildSortCondition(sortBy, sortOrder) || []

    const [totalCountResult, productsData] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(product)
        .where(and(...whereConditions)),
      db
        .select()
        .from(product)
        .where(and(...whereConditions))
        // .orderBy(...orderByCondition)
        .limit(pageSize)
        .offset(offset),
    ])

    const totalCount = Number(totalCountResult[0]?.count)

    return NextResponse.json({
      data: productsData,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
    })
  } catch (error) {
    console.error("Error fetching products: ", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// export async function POST(req: Request) {
//   try {
//     const session = await auth()
//     if (!session) {
//       return new NextResponse("Unauthorized", { status: 401 })
//     }

//     const body = await req.json()
//     const { name, description, categoryId, manufacturerId, status, tags, variants } = body

//     const newProduct = await db
//       .insert(product)
//       .values({
//         name,
//         description,
//         categoryId,
//         manufacturerId,
//         status,
//         tags,
//       })
//       .returning()

//     const productVariants = variants.map((variant: any) => ({
//       ...variant,
//       productId: newProduct[0]?.id,
//     }))

//     await db.insert(productVariant).values(productVariants)

//     return NextResponse.json(newProduct[0])
//   } catch (error) {
//     console.error("[PRODUCTS_POST]", error)
//     return new NextResponse("Internal error", { status: 500 })
//   }
// }
