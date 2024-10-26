import { asc, desc, ilike, or, SQL, SQLWrapper } from "drizzle-orm"
import { product } from "./schema"

export const buildSearchCondition = (search: string) => {
  if (!search) return []

  return [
    or(
      ilike(product.name, `%{search}%`),
      ilike(product.description, `%{search}%`)
    ),
  ]
}

type ValidSortColumns = "name" | "id"
export const buildSortCondition = (
  sortBy: string | null,
  sortOrder: "asc" | "desc"
): SQLWrapper => {
  if (!sortBy) {
    // Default sort - you might want to change this
    return asc(product.id)
  }

  const validColumns: ValidSortColumns[] = ["name", "id"]

  if (!validColumns.includes(sortBy as ValidSortColumns)) {
    // Default sort if invalid column
    return asc(product.id)
  }

  // Type assertion is safe here because we've checked validity
  const column = product[sortBy as ValidSortColumns]

  return sortOrder === "desc" ? desc(column) : asc(column)
}
