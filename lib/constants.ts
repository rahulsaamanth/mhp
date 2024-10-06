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
    // add new product icon
    // icon: "fluent:cube-add-20-regular",
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
    // coupon icon
    // icon: "mdi:coupon-outline",
    // discount icon
    // icon: "flowbite:sale-percent-outline",
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
