import SideNav from "@/components/side-nav"
// import { Navbar } from "./_components/navbar"
import MarginWidthWrapper from "@/components/margin-width-wrapper"
import Header from "@/components/header"
import HeaderMobile from "@/components/header-mobile"
import PageWrapper from "@/components/page-wrapper"
import { Metadata } from "next"
import { CurrentPathAndDateTime } from "@/components/current-path-date-time"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from "@/lib/providers"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"

interface ProtectedLayoutProps {
  children: React.ReactNode
}
export const metadata: Metadata = {
  title: "MHP - Admin",
  description: "Mangalore Homeopathic Pharmacy - Admin",
}

const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <div className="flex h-auto w-full">
        <SideNav />
        <main className="min-h-max flex-1">
          <MarginWidthWrapper>
            <Header />
            <HeaderMobile />
            <PageWrapper>
              {/* <CurrentPathAndDateTime /> */}
              <Providers>
                <TooltipProvider>{children}</TooltipProvider>
              </Providers>
            </PageWrapper>
          </MarginWidthWrapper>
        </main>
      </div>
    </SessionProvider>
  )
}

export default ProtectedLayout
