import { db } from "@/drizzle/db"
import { NextResponse } from "next/server"

export async function GET() {
  const users = await db.query.user.findMany()

  if (!users) return new NextResponse(null, { status: 404 })

  return new NextResponse(JSON.stringify(users), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
