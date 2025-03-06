import { db } from "@/db/db"
import { product } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id)
      return NextResponse.json(
        {
          error: "Product ID is required",
        },
        { status: 400 }
      )
    const _product = await db.query.product.findFirst({
      where: eq(product.id, id),
      with: {
        category: true,
        manufacturer: true,
        variants: true,
      },
    })
    if (!_product)
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 }
      )
    return NextResponse.json(_product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
