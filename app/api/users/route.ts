import { db } from "@/db/db"
import { NextResponse } from "next/server"
export const runtime = "edge"

export async function GET() {
  const users = await db.query.user.findMany()

  if (!users) return new NextResponse(null, { status: 404 })

  return new NextResponse(JSON.stringify(users), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
