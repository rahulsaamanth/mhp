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

interface ProtectedLayoutProps {
  children: React.ReactNode
}
export const metadata: Metadata = {
  title: "MHP - Admin",
  description: "Mangalore Homeopathic Pharmacy - Admin",
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  // return (
  //   <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
  //     <Navbar />
  //     {children}
  //   </div>
  // )
  return (
    <>
      <div className="flex h-auto w-full">
        <SideNav />
        <main className="min-h-max flex-1">
          <MarginWidthWrapper>
            <Header />
            <HeaderMobile />
            <PageWrapper>
              <CurrentPathAndDateTime />
              <Providers>
                <TooltipProvider>{children}</TooltipProvider>
              </Providers>
            </PageWrapper>
          </MarginWidthWrapper>
        </main>
      </div>
    </>
  )
}

export default ProtectedLayout
