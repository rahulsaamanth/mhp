// Email template functions for various notifications and communications
import "dotenv/config"

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

// Base function to send emails using Resend API
const sendEmail = async ({
  to,
  subject,
  html,
  from = "noreply@homeosouth.com",
}: EmailData) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to send email: ${errorData}`)
  }

  return response.json()
}

// CLI function to send email from command line
const sendEmailCLI = async () => {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error(`
Usage: node send-mail.ts <to> <subject> <html> [from]

Arguments:
  to      - Recipient email address
  subject - Email subject
  html    - HTML content (use quotes for multi-word content)
  from    - Optional sender email (defaults to noreply@homeosouth.com)

Example:
  node send-mail.ts "user@example.com" "Test Subject" "<h1>Hello World</h1>" 
    `)
    process.exit(1)
  }

  const [toArg, subjectArg, htmlArg, fromArg] = args

  // Ensure required parameters are strings
  const to: string = toArg || ""
  const subject: string = subjectArg || ""
  const html: string = htmlArg || ""
  const from: string | undefined = fromArg

  try {
    console.log("Sending email...")
    const result = await sendEmail({ to, subject, html, from })
    console.log("Email sent successfully:", result)
  } catch (error) {
    console.error("Failed to send email:", error)
    process.exit(1)
  }
}

// Execute CLI function if this file is run directly
if (require.main === module) {
  sendEmailCLI()
}

export { sendEmail }
