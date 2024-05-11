import { ReactNode } from "react"

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-grow flex-col space-y-10 bg-zinc-50 px-4 py-8 sm:px-10 lg:px-20">
      {children}
    </div>
  )
}
