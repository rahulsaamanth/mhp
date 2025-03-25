import { currentRole } from "@/lib/auth"

import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  const role = await currentRole()

  if (role !== "ADMIN") return new NextResponse(null, { status: 403 })

  return new NextResponse(null, { status: 200 })
}
