import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./styles/globals.css"
import { auth } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"

const robotoMono = Roboto_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-roboto-mono",
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
  return (
    <html lang="en" className={`${robotoMono.variable} antialiased`}>
      <head>
        {/* <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          ></script> */}
      </head>
      <body>
        <Toaster richColors theme="light" toastOptions={{}} />
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
