import { Resend } from "resend"

export const sendVerificationEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.PUBLIC_APP_URL!}/admin/auth/new-verification?token=${token}`

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@mail.rahulsaamanth.in",
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to send verification email")
  }

  return response.json()
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.PUBLIC_APP_URL!}/admin/auth/new-password?token=${token}`

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@mail.rahulsaamanth.in",
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to send password reset email")
  }

  return response.json()
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@mail.rahulsaamanth.in",
      to: email,
      subject: "2FA Code",
      html: `
        <h1>2FA Code</h1>
        <p>Your two factor authentication code is:</p>
        <p style="font-size: 24px; font-weight: bold;">${token}</p>
        <p>This code will expire in 5 minutes.</p>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to send 2FA email")
  }

  return response.json()
}
