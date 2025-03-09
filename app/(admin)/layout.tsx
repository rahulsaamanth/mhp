import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./admin/styles/globals.css"
import { auth } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { redirect } from "next/navigation"

const MontSerrat = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MHP - Admin Login",
  description: "Mangalore Homeopathic Pharmacy - Admin Panel",
}

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en" className={MontSerrat.className}>
        <body>
          <Toaster richColors theme="light" toastOptions={{}} />
          <NuqsAdapter>{children}</NuqsAdapter>
        </body>
      </html>
    </SessionProvider>
  )
}
