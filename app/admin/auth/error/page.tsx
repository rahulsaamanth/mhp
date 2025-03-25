import { ErrorCard } from "@/components/auth/error-card"
export const runtime = "edge"

const AuthErrorPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) => {
  const { error } = await searchParams

  return <ErrorCard error={error} />
}

export default AuthErrorPage
