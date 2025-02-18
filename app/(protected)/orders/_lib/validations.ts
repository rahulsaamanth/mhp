import { type Order } from "@/db/schema"
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
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<Order & { customerName: string }>().withDefault([
    { id: "orderDate", desc: true },
  ]),
  orderId: parseAsString.withDefault(""),
  customerName: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetOrdersSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
