import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "noreply@mail.rahulsaamanth.in",
    to: email,
    subject: "MFA Code",
    html: `<p>Your MFA code: ${token}</p>`,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/admin/auth/new-password?token=${token}`

  await resend.emails.send({
    from: "noreply@mail.rahulsaamanth.in",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  })
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/admin/auth/new-verification?token=${token}`

  await resend.emails.send({
    from: "noreply@mail.rahulsaamanth.in",
    to: email,
    subject: "Confirm your account",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  })
}

// async function mail() {
//   await resend.emails.send({
//     from: "noreply@mail.rahulsaamanth.in",
//     to: "shivakumarreddyg27@gmail.com",
//     subject: "message",
//     html: `<p>Errrifush</p>`,
//   })
//   console.log("✅ mail sent.")
// }

// mail().catch((e) => {
//   console.error("❌ error whie sending email:")
//   console.error(e)
//   process.exit(1)
// })
