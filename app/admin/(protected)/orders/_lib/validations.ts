import { type Order } from "@rahulsaamanth/mhp-schema"
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers"
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    []
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Order>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  orderId: parseAsString.withDefault(""),
  userName: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetOrdersSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
