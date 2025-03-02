import { cn } from "@/lib/utils"

interface JsonViewerProps {
  data: unknown
  className?: string
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  return (
    <pre
      className={cn(
        "rounded-lg bg-muted p-4 overflow-auto",
        "font-mono text-sm",
        className
      )}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
