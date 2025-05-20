"use client"

import React from "react"
import { format } from "date-fns"
import { DeleteDiscountCodeDialog } from "./delete-discount-code-dialog"
import { ToggleDiscountCodeStatus } from "./toggle-discount-code-status"

// Define the type for discount code
interface DiscountCode {
  id: string
  code: string
  description: string | null
  discountAmount: number
  discountType: "PERCENTAGE" | "FIXED"
  isActive: boolean
  allProducts: boolean
  minimumOrderValue: number | null
  createdAt: Date
  limit: number | null
  expiresAt: Date | null
  usageCount: number | null
}

interface DiscountCodesTableProps {
  discountCodes: DiscountCode[]
}

const DiscountCodesTable: React.FC<DiscountCodesTableProps> = ({
  discountCodes,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Code
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Discount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Min Order
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Usage
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Created
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Expires
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {discountCodes.map((discount) => (
            <tr key={discount.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {discount.code}
                </div>
                <div className="text-sm text-gray-500">
                  {discount.description || "—"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {discount.discountType === "PERCENTAGE"
                    ? `${discount.discountAmount}%`
                    : `$${discount.discountAmount.toFixed(2)}`}
                </div>
                <div className="text-xs text-gray-500">
                  {discount.allProducts ? "All products" : "Selected products"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${discount.minimumOrderValue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    discount.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {discount.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {discount.usageCount} / {discount.limit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(discount.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {discount.expiresAt
                  ? format(new Date(discount.expiresAt), "MMM d, yyyy")
                  : "Never"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-startspace-x-2">
                  <ToggleDiscountCodeStatus
                    discountCodeId={discount.id}
                    isActive={discount.isActive}
                  />
                  <DeleteDiscountCodeDialog
                    discountCodeId={discount.id}
                    discountCodeName={discount.code}
                  />
                </div>
              </td>
            </tr>
          ))}
          {discountCodes.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No discount codes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DiscountCodesTable
