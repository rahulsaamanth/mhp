import { db } from "@/drizzle/db"
import { product } from "@/drizzle/schema"
import { buildSearchCondition, buildSortCondition } from "@/drizzle/utils"
import { and, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

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
    const orderByCondition = buildSortCondition(sortBy, sortOrder)

    const [totalCountResult, productsData] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(product)
        .where(and(...whereConditions)),
      db
        .select()
        .from(product)
        .where(and(...whereConditions))
        .limit(pageSize)
        .offset(offset),
    ])

    const totalCount = Number(totalCountResult[0].count)

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
