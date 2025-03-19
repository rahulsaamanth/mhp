import { cn } from "@/lib/utils"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex h-full items-center justify-center",
        "auth-background",
      )}
    >
      {children}
    </div>
  )
}
export default AuthLayout
