import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export interface DashboardPopularProductsShortTableProps {
  data: {
    id: string
    name: string
    sales: string
    image: string[]
  }[]
}

export const DashboardPopularProductsShortTable = ({
  data,
}: DashboardPopularProductsShortTableProps) => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Popular Products</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 pt-4">
        {data.map((product) => (
          <div className="flex items-center gap-4" key={`${product.id}`}>
            <img
              src={product.image[0] || "/_logo.jpg"}
              alt="failed to load"
              className="size-12"
            />

            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{product.name}</p>
            </div>
            <div className="ml-auto font-medium">+ {product.sales} orders</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

type DashboardLatestProductsShortTableProps = {
  data: {
    productVariantId: string
    productName: string | null
    productPotency: string | null
    productPackSize: number | null
    dateAdded: Date
    category: string | null
    // stock: number | null
  }[]
}

export const DashboardLatestProductsShortTable = ({
  data,
}: DashboardLatestProductsShortTableProps) => {
  return (
    <Card className="rounded-sm">
      <CardHeader className="flex-row justify-between w-full">
        <CardTitle>Latest Products</CardTitle>
        <Link href="/products/new">
          <Button variant="default">Add New</Button>
        </Link>
      </CardHeader>
      <CardContent className="grid gap-8 pt-4">
        {data.map((product) => (
          <div
            className="flex items-center justify-between px-2"
            key={product.productVariantId}
          >
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {product.productName} . {product.productPotency} .{" "}
                {product.productPackSize}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.category}
              </p>
            </div>
            <div className="font-medium">
              {product.dateAdded.toDateString()}
            </div>
            {/* <div>{product.stock} </div> */}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
