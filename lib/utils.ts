import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import OpenAI from "openai"

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

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
export async function generateSKU({
  productManufacturer,
  productName,
  packSize,
  potency,
}: {
  productManufacturer: string
  productName: string
  packSize: string
  potency?: string
}): Promise<string> {
  const brandCode = productManufacturer.slice(0, 3).toUpperCase()

  const productCode = getEnhancedProductCode(productName)

  const variantCode = potency || "STD"

  const sizeCode = normalizeSizeCode(packSize)

  if (productCode.startsWith("BC") && !isNaN(Number(productCode.slice(2)))) {
    return `${brandCode}-${productCode}-${sizeCode}`.toUpperCase()
  }

  return `${brandCode}-${productCode}-${variantCode}-${sizeCode}`.toUpperCase()
}

/**
 * Uses OpenAI API to generate intelligent product codes
 */
// async function getAIGeneratedProductCode(productName: string): Promise<string> {
//   try {
//     if (productName.toLowerCase().includes("combination")) {
//       const match = productName.match(/combination\s*(\d+)/i)
//       if (match && match[1]) {
//         return `BC${match[1]}`
//       }
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a product SKU generator. Generate a short, meaningful product code (3-6 characters) " +
//             "based on the product name. For homeopathic remedies, use standard abbreviations. " +
//             "For example: 'Silicea' should be 'SIL', 'Natrum Sulphuricum' should be 'NAT-SUL'. " +
//             "Product code should be concise, recognizable, and consistent with industry standards. " +
//             "Return ONLY the code, no explanation.",
//         },
//         {
//           role: "user",
//           content: `Generate product code for: ${productName}`,
//         },
//       ],
//       max_tokens: 10,
//       temperature: 0.3,
//     })

//     const suggestedCode = response.choices[0]?.message?.content?.trim() || ""

//     if (suggestedCode && suggestedCode.length <= 10) {
//       return suggestedCode.replace(/[^A-Z0-9-]/gi, "")
//     }

//     return getEnhancedProductCode(productName)
//   } catch (error) {
//     console.error("Error generating AI product code:", error)
//     return getEnhancedProductCode(productName)
//   }
// }

function getEnhancedProductCode(productName: string): string {
  const words = productName.split(/\s+/).filter((word) => word.length > 0)

  if (words.length >= 3) {
    return words.map((word) => word.charAt(0)).join("")
  }

  const baseCode = words
    .map((word) => (word.length > 3 ? word.slice(0, 3) : word))
    .join("")

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
  const match = packSize.match(/(\d+)\s*([a-zA-Z]+)?/)
  if (!match) return packSize

  const [, quantity = "", unit = ""] = match

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
    return `${quantity}C`
  }

  return unit ? `${quantity}${unit.charAt(0).toUpperCase()}` : quantity
}

/**
 * Format: [Product Name] - [Potency/Form] - ([Size])
 * Examples:
 * - Silicea - 3X - 20gms
 * - Bio Combination 10 - 25gms
 * - Sunny Hair Removal Cream - 100gms
 */
export async function generateVariantName({
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
