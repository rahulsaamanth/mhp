import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./styles/globals.css"
import { auth } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/lib/providers"

import { GeistSans } from "geist/font/sans"

export const metadata: Metadata = {
  title: "MHP - Admin Login",
  description: "Mangalore Homeopathic Pharmacy - Admin Panel",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en" className={GeistSans.className}>
        <body>
          <Toaster richColors theme="light" toastOptions={{}} />
          {/* <Providers>{children}</Providers> */}
          {children}
        </body>
      </html>
    </SessionProvider>
  )
}
