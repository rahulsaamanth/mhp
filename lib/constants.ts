import { SideNavItem } from "@/types"

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "carbon:dashboard-reference",
  },

  {
    title: "Products",
    path: "/products",
    icon: "fluent-mdl2:product-variant",
    submenu: true,
    subMenuItems: [
      {
        title: "all products",
        path: "/products",
        icon: "fluent-mdl2:product-list",
      },
      {
        title: "add new",
        path: "/products/add-new",
        icon: "fluent:cube-add-20-regular",
      },
    ],
  },
  {
    title: "Orders",
    path: "/orders",
    icon: "material-symbols:orders-outline",
  },
  {
    title: "Customers",
    path: "/users",
    icon: "ph:users-three",
  },
  {
    title: "Reviews",
    path: "/reviews",
    icon: "material-symbols:reviews-outline",
  },
  {
    title: "Offers",
    path: "/offers",
    icon: "ic:outline-local-offer",
    submenu: true,
    subMenuItems: [
      {
        title: "Coupons",
        path: "/offers/coupons",
        icon: "mdi:coupon-outline",
      },
      {
        title: "Discounts",
        path: "/offers/discounts",
        icon: "flowbite:sale-percent-outline",
      },
    ],
  },
  {
    title: "Admin",
    path: "/admin",
    icon: "eos-icons:admin-outlined",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: "material-symbols:settings-outline",
  },
]
