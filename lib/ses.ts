import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

// Configure AWS SES client
const sesClient = new SESv2Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
})

interface SendEmailParams {
  from: string
  to: string[]
  subject: string
  html?: string
  text?: string
}

/**
 * Send an email using AWS SES
 */
export async function sendEmail({
  from,
  to,
  subject,
  html,
  text,
}: SendEmailParams) {
  try {
    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: {
        ToAddresses: to,
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            ...(html && {
              Html: {
                Data: html,
                Charset: "UTF-8",
              },
            }),
            ...(text && {
              Text: {
                Data: text,
                Charset: "UTF-8",
              },
            }),
          },
        },
      },
    })

    const response = await sesClient.send(command)
    console.log("Email sent successfully:", response)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}
