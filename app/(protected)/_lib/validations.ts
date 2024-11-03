import { product } from "@/drizzle/schema"
import type { FilterOperator, JoinOperator } from "@/types"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

import * as z from "zod"

import { parseAsFilters, parseAsSort } from "@/lib/parsers"

export const filterConditionSchema = z.object({
  id: z.string(),
  value: z.string(),
  operator: z.custom<FilterOperator>(),
  joinOperator: z.custom<JoinOperator>(),
})

export const searchParamsCache = createSearchParamsCache({
  //   flags: parseAsArrayOf(z.enum(["advancedFilter", "floatingBar"])).withDefault(
  //     []
  //   ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  //   sort: parseAsSort(product).withDefault({
  //     column: "createdAt",
  //     order: "desc",
  //   }),
  //   name: parseAsString.withDefault(""),
  //   filters: parseAsFilters(product).withDefault([]),
  //   joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetProductsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
