import { type Product } from "@/db/schema"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    []
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<Product>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  // status: parseAsArrayOf(z.enum(product.status.enumValues)).withDefault([]),
  // priority: parseAsArrayOf(z.enum(tasks.priority.enumValues)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export const getProductsSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).default(10),
  sort: z.array(z.object({ id: z.string(), desc: z.boolean() })).default([]),
  name: z.string().optional(),
  filters: z.array(z.any()).optional(),
  flags: z.array(z.string()).default([]),
  from: z.string().nullable(),
  to: z.string().nullable(),
  joinOperator: z.enum(["and", "or"]).default("and"),
})

export type GetProductsSchema = z.infer<typeof getProductsSchema>
