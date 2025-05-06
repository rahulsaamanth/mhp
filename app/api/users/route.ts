import { db } from "@/db/db"
import { user } from "@rahulsaamanth/mhp-schema"
import { ilike, or } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("search")
  const pageSize = parseInt(searchParams.get("pageSize") || "20")

  try {
    const users = await db.query.user.findMany({
      where: query
        ? or(
            ilike(user.name, `%${query}%`),
            ilike(user.email, `%${query}%`),
            ilike(user.phone || "", `%${query}%`)
          )
        : undefined,
      limit: pageSize,
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
