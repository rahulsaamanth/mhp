import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/ses"

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      from: `test@homeosouth.com`, // Use your verified domain
      to: [to],
      subject: "Test Email from AWS SES",
      html: "<h1>Hello from AWS SES!</h1><p>This is a test email sent from your Next.js application.</p>",
      text: "Hello from AWS SES! This is a test email sent from your Next.js application.",
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error in email API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
