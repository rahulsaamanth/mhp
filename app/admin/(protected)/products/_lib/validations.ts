import { category, product, type Product } from "@rahulsaamanth/mhp-schema"
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
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Product>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  categoryName: parseAsArrayOf(z.string()).withDefault([]),
  categoryPath: parseAsString.withDefault(""),
  manufacturerName: parseAsArrayOf(z.string()).withDefault([]),
  status: parseAsArrayOf(z.enum(product.status.enumValues)).withDefault([]),
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
  categoryName: z.union([z.string(), z.array(z.string())]).default([]),
  categoryPath: z.string(),
  manufacturerName: z.union([z.string(), z.array(z.string())]).default([]),
  status: z.union([z.string(), z.array(z.string())]).default([]),
  from: z.string().nullable(),
  to: z.string().nullable(),
  filters: z.array(z.any()).optional(),
  flags: z.array(z.string()).default([]),
  joinOperator: z.enum(["and", "or"]).default("and"),
})

export type GetProductsSchema = z.infer<typeof getProductsSchema>
