import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardPopularProductsShortTableProps = {
  data: {
    productId: string
    productName: string | null
    productPotency: string | null
    productPackSize: string | null
    variantImage: string[]
    totalOrders: number
  }[]
}

export const DashboardPopularProductsShortTable = ({
  data,
}: DashboardPopularProductsShortTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Products</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 pt-4">
        {data.map((product) => (
          <div className="flex items-center gap-4" key={product.productId}>
            <img
              src={product.variantImage[0]}
              alt="Avatar"
              className="size-12"
            />

            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {product.productName}
              </p>
              <p className="text-sm text-muted-foreground">
                {product.productPotency && product.productPotency} .{" "}
                {product.productPackSize && product.productPackSize}
              </p>
            </div>
            <div className="ml-auto font-medium">
              + {product.totalOrders} orders
            </div>
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
    productPackSize: string | null
    dateAdded: Date
    category: string | null
    stock: number | null
  }[]
}

export const DashboardLatestProductsShortTable = ({
  data,
}: DashboardLatestProductsShortTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Products</CardTitle>
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
            <div>{product.stock} </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
