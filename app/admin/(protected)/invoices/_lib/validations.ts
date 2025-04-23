// /home/rahulsaamanth/Code0/mhp/app/admin/(protected)/invoices/_lib/validations.ts
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
    { id: "orderDate", desc: true },
  ]),
  invoiceNumber: parseAsString.withDefault(""),
  userName: parseAsString.withDefault(""),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
})

export type GetInvoicesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>
