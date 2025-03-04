import { auth } from "@/auth"
import { db } from "@/db/db"
import { product } from "@/db/schema"

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  console.log(session)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, categoryId, manufacturerId } =
      await request.json()

    if (!name || !description || !categoryId || !manufacturerId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const _product = await db
      .insert(product)
      .values({
        name,
        description,
        categoryId,
        manufacturerId,
      })
      .returning()

    // add atleast one variant

    if (!_product) {
      return NextResponse.json(
        { error: "Error creating product" },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { message: "Product created successfully", product: _product },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
