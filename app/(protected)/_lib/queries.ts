import "server-only"

import { product } from "@/drizzle/schema"
import { and, asc, count, desc, ilike } from "drizzle-orm"

import { type GetProductsSchema } from "./validations"
import { unstable_cache } from "@/lib/unstable-cache"
import { db } from "@/drizzle/db"
import { filterColumns } from "@/lib/filter-columns"

export async function getProducts(input: GetProductsSchema) {
  return unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage
        // const { column, order } = input.sort
        // const advancedFilter =
        //   input.flags.includes("advancedFilter") && input.filters.length > 0
        // const advancedWhere = filterColumns({
        //   table: product,
        //   filters: input.filters,
        //   joinOperator: input.joinOperator,
        // })
        // const where = advancedFilter
        //   ? advancedWhere
        //   : and(
        //       input.name ? ilike(product.name, `%${product.name}`) : undefined
        //     )

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(product)
            .limit(input.perPage)
            .offset(offset)
          // .where(where)
          // .orderBy(
          //   order === "asc" ? asc(product[column]) : desc(product[column])
          // )

          const total = await tx
            .select({ count: count() })
            .from(product)
            // .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

          return { data, total }
        })
        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      } catch (error) {
        return { data: [], pageCount: 0 }
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 3600,
      tags: ["products"],
    }
  )
}
