import SideNav from "@/components/side-nav"
// import { Navbar } from "./_components/navbar"
import MarginWidthWrapper from "@/components/margin-width-wrapper"
import Header from "@/components/header"
import HeaderMobile from "@/components/header-mobile"
import PageWrapper from "@/components/page-wrapper"
import { Metadata } from "next"
import { CurrentPage } from "@/components/current-page"

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
        <main className="flex-1 min-h-max">
          <MarginWidthWrapper>
            <Header />
            <HeaderMobile />
            <PageWrapper>
              <CurrentPage />
              {children}
            </PageWrapper>
          </MarginWidthWrapper>
        </main>
      </div>
    </>
  )
}

export default ProtectedLayout
