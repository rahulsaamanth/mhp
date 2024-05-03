import { ReactNode } from "react"

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col pt-2 pb-4 px-4 space-y-2 flex-grow min-h-screen bg-white">
      {children}
    </div>
  )
}
