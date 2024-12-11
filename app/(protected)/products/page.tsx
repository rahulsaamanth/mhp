import { type SearchParams } from "@/types"
import { searchParamsCache } from "./_lib/validations"
import { getValidFilters } from "@/lib/data-table"
import { getProducts } from "./_lib/queries"

import { FeatureFlagsProvider } from "./_components/feature-flags-provider"
import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { ProductsTable } from "./_components/products-table"
import { product } from "@/db/schema"
import { sql } from "drizzle-orm"
import { db } from "@/db/db"

async function getProductsForDataTable() {
  const data = await db
    .select({
      id: product.id,
      name: product.name,
      status: product.status,
      createdAt: product.createdAt,
      firstImage: sql<string>`(
      SELECT (pv."variantImage"[1])
      FROM "ProductVariant" pv
      WHERE pv."productId" = "Product"."id"
      LIMIT 1
    )`,
      sales: sql<number>`(
      SELECT COUNT(DISTINCT od."orderId")
      FROM "OrderDetails" od
      JOIN "ProductVariant" pv ON od."productVariantId" = pv."id"
      WHERE pv."productId" = "Product"."id"
    )`,
      minPrice: sql<number>`(
      SELECT MIN(pv."price")
      FROM "ProductVariant" pv
      WHERE pv."productId" = "Product"."id"
    )`,
      maxPrice: sql<number>`(
      SELECT MAX(pv."price")
      FROM "ProductVariant" pv
      WHERE pv."productId" = "Product"."id"
    )`,
    })
    .from(product)
    .orderBy(product.createdAt)
  return data
}

interface ProductPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductPage(props: ProductPageProps) {
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const productsPromise = getProducts({
    ...search,
    filters: validFilters,
  })
  const testProducts = await getProductsForDataTable()
  // console.log(testProducts)

  return (
    // <Shell className="gap-2">
    <>
      <FeatureFlagsProvider>
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
            shallow={false}
          />
        </React.Suspense>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <ProductsTable promise={productsPromise} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </>
    // </Shell>
  )
}
