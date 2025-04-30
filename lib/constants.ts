import { SideNavItem } from "@/types"

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: "carbon:dashboard-reference",
  },

  {
    title: "Products",
    path: "/admin/products",
    icon: "fluent-mdl2:product-variant",
    // add new product icon
    // icon: "fluent:cube-add-20-regular",
  },
  {
    title: "SKU",
    path: "/admin/sku-options",
    icon: "fluent:options-20-regular",
  },
  {
    title: "Orders",
    path: "/admin/orders",
    icon: "material-symbols:orders-outline",
  },
  {
    title: "Customers",
    path: "/admin/users",
    icon: "ph:users-three",
  },
  {
    title: "Invoices",
    path: "/admin/invoices",
    icon: "basil:invoice-outline",
  },
  {
    title: "Coupons",
    path: "/admin/coupons",
    icon: "ic:outline-local-offer",
    // coupon icon
    // icon: "mdi:coupon-outline",
    // discount icon
    // icon: "flowbite:sale-percent-outline",
  },

  {
    title: "Admin",
    path: "/admin/admin",
    icon: "eos-icons:admin-outlined",
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: "material-symbols:settings-outline",
  },
]

export const COMMON_TAGS = [
  "HOMEOPATHY",
  "NUTRITION-SUPPLEMENTS",
  "BIOCHEMIC",
  "BIOCOMBINATION",
  "DILUTION",
  "MOTHERTINCTURE",
  "SBL",
  "DR.RECKEWEG",
  "6X",
  "30X",
  "200C",
  "1M",
]

export const unknownError = "An unknown error occurred. Please try again later."

export const databasePrefix = "shadcn"
