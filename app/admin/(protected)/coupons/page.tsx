import { db } from "@/db/db"
import DiscountCodesTable from "./_components/discount-codes-table"
// import { AddDiscountCodeDialog } from "./_components/add-discount-code-dialog"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CouponsPage() {
  const allDiscountCodes = await db.query.discountCode.findMany({
    orderBy: (discountCode, { desc }) => [desc(discountCode.createdAt)],
  })

  // Separate active and inactive discount codes
  const activeDiscountCodes = allDiscountCodes.filter((code) => code.isActive)
  const inactiveDiscountCodes = allDiscountCodes.filter(
    (code) => !code.isActive
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Link href={"/admin/coupons/new"}>
          <Button>Add New Coupon</Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Discount Codes</h2>
          <DiscountCodesTable discountCodes={activeDiscountCodes} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Inactive Discount Codes
          </h2>
          <DiscountCodesTable discountCodes={inactiveDiscountCodes} />
        </div>
      </div>
    </div>
  )
}
