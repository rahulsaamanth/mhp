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

/**
 * Format: [BRAND]-[PRODUCT]-[VARIANT]-[SIZE]
 * Examples:
 * - DR-SIL-3X-20T (Dr.Reckeweg Silicea 3X 20 tablets)
 * - SBL-BC10-25T (SBL Bio Combination 10 25 tablets)
 * - BAK-SUN-HRC-100G (Bakson Sunny Hair Removal Cream 100g)
 */
export function generateSKU({
  productManufacturer,
  productName,
  packSize,
  potency,
}: {
  productManufacturer: string
  productName: string
  packSize: string
  potency?: string
}) {
  // Extract brand code (first 3 letters of manufacturer)
  const brandCode = productManufacturer.slice(0, 3).toUpperCase()

  // Get product code (abbreviated product name)
  const productCode = getProductCode(productName)

  // Get variant code (form/potency)
  const variantCode = potency

  // Get size code
  const sizeCode = packSize

  return `${brandCode}-${productCode}-${variantCode}-${sizeCode}`.toUpperCase()
}

/**
 * Format: [Product Name] - [Potency/Form] - ([Size])
 * Examples:
 * - Silicea - 3X - 20gms
 * - Bio Combination 10 - 25gms
 * - Sunny Hair Removal Cream - 100gms
 */
export function generateVariantName({
  productName,
  packSize,
  potency,
}: {
  productName: string
  packSize: string
  potency?: string
}) {
  if (potency) {
    return `${productName} - ${potency} - ${packSize}`
  }

  return `${productName} - ${packSize}`
}

function getProductCode(productName: string): string {
  // Extract meaningful part of product name
  const name = productName.split(" ").slice(-2).join(" ")
  return name
    .split(" ")
    .map((word) => word.slice(0, 3))
    .join("")
}
