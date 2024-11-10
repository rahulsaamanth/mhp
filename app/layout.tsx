import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./styles/globals.css"
import { auth } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"

// import { Providers } from "@/lib/providers"

// import { GeistSans } from "geist/font/sans"

const MontSerrat = Montserrat({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
})

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
      <html lang="en" className={MontSerrat.className}>
        <body>
          <Toaster richColors theme="light" toastOptions={{}} />
          {/* <Providers>{children}</Providers> */}
          <NuqsAdapter>{children}</NuqsAdapter>
        </body>
      </html>
    </SessionProvider>
  )
}
