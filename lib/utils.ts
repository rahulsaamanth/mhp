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

  // Get product code (improved method for more uniqueness)
  const productCode = getEnhancedProductCode(productName)

  // Get variant code (form/potency)
  // If potency is missing, use a placeholder to maintain SKU structure
  const variantCode = potency || "STD"

  // Process size code to ensure uniqueness
  const sizeCode = normalizeSizeCode(packSize)

  return `${brandCode}-${productCode}-${variantCode}-${sizeCode}`.toUpperCase()
}

/**
 * Creates a more unique product code by:
 * 1. Using first character of each word for products with 3+ words
 * 2. Using first 3 chars of each word for 1-2 word products
 * 3. Adding numeric identifiers for common words
 */
function getEnhancedProductCode(productName: string): string {
  const words = productName.split(/\s+/).filter((word) => word.length > 0)

  // For longer product names, use initials
  if (words.length >= 3) {
    return words.map((word) => word.charAt(0)).join("")
  }

  // For shorter names, use first 3 chars of each word (or whole word if shorter)
  const baseCode = words
    .map((word) => (word.length > 3 ? word.slice(0, 3) : word))
    .join("")

  // Add numeric suffix for common words to increase uniqueness
  if (productName.toLowerCase().includes("combination")) {
    const match = productName.match(/combination\s*(\d+)/i)
    if (match && match[1]) {
      return `BC${match[1]}`
    }
  }

  return baseCode
}

/**
 * Normalizes size codes for consistency and uniqueness
 */
function normalizeSizeCode(packSize: string): string {
  // Extract numbers and unit from size
  const match = packSize.match(/(\d+)\s*([a-zA-Z]+)?/)
  if (!match) return packSize

  const [, quantity = "", unit = ""] = match

  // Normalize units
  const normalizedUnit = unit.toLowerCase()
  if (normalizedUnit.includes("tab") || normalizedUnit.includes("pill")) {
    return `${quantity}T`
  } else if (normalizedUnit.includes("gram") || normalizedUnit.includes("gm")) {
    return `${quantity}G`
  } else if (
    normalizedUnit.includes("ml") ||
    normalizedUnit.includes("litre")
  ) {
    return `${quantity}ML`
  } else if (normalizedUnit.startsWith("c")) {
    // For "capsules"
    return `${quantity}C`
  }

  // If no specific unit identified, use first letter or return as is
  return unit ? `${quantity}${unit.charAt(0).toUpperCase()}` : quantity
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

// function getProductCode(productName: string): string {
//   // Extract meaningful part of product name
//   const name = productName.split(" ").slice(-2).join(" ")
//   return name
//     .split(" ")
//     .map((word) => word.slice(0, 3))
//     .join("")
// }
