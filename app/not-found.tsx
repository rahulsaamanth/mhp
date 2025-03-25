export const runtime = "edge"

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">404 - Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  )
}
