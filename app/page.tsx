import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { LoginButton } from "@/components/auth/login-button"

export default async function Home() {
  return (
    <main
      className={cn(
        "flex h-full flex-col items-center justify-center",
        "auth-background"
      )}
    >
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold drop-shadow-md">🔐 Admin</h1>
        <p className="text-2xl font-bold">Magalore Homeopathic Pharmacy</p>
        <div>
          <LoginButton>
            <Button variant="default" size={"lg"} className="rounded-none">
              Sign In
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  )
}
