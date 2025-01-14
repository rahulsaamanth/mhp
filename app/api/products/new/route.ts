import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, age } = await request.json()

    return NextResponse.json(
      { message: `Hello ${name}${age}!` },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
