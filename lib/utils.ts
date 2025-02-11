import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date))
}

/**
 * Stole this from the @radix-ui/primitive
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event)
    }
  }
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim()
}

export function generateVariantName({
  productName,
  potency,
  packSize,
}: {
  productName: string
  potency?: string
  packSize?: string
}) {
  const parts = [productName]

  if (potency) {
    parts.push(potency)
  }

  if (packSize) {
    parts.push(packSize)
  }

  return parts.join(" - ")
}

export function generateSKU({
  productName,
  productForm,
  potency,
  packSize,
}: {
  productName: string
  productForm: string
  potency?: string
  packSize?: string
}) {
  // Convert product name to uppercase and take first 3 characters
  const productCode = productName
    .replace(/[^A-Z]/gi, "")
    .toUpperCase()
    .slice(0, 3)

  // Convert manufacturer name to uppercase and take first 2 characters
  const productFormCode = productForm
    .replace(/[^A-Z]/gi, "")
    .toUpperCase()
    .slice(0, 2)

  // Format potency (e.g., "30C" -> "30C", "200CH" -> "200")
  const potencyCode = potency
    ? potency.replace(/[^0-9]/g, "").padStart(3, "0")
    : "000"

  // Format pack size (e.g., "30ml" -> "030", "100tabs" -> "100")
  const sizeCode = packSize
    ? packSize.replace(/[^0-9]/g, "").padStart(3, "0")
    : "000"

  // Generate random number for uniqueness
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")

  // Combine all parts
  return `${productCode}${productFormCode}${potencyCode}${sizeCode}${random}`
}
