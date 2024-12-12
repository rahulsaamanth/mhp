import { ReactNode } from "react"

export default function MarginWidthWrapper({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-auto flex-col sm:border-r sm:border-zinc-700 xl:ml-52">
      {children}
    </div>
  )
}
