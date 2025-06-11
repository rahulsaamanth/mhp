import { formatDate } from "@/lib/formatters"

/**
 * Safe wrapper for formatDate that can handle null values and invalid dates
 */
export function safeDateFormat(date: Date | null | undefined): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "N/A"
  }

  try {
    return formatDate(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}
