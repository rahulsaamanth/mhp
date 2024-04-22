import { SideNavItem } from "@/types"
import { Icon } from "@iconify/react"

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Icon icon="carbon:dashboard-reference" width="20" height="20" />,
  },
  {
    title: "Customers",
    path: "/users",
    icon: <Icon icon="ph:users" width="20" height="20" />,
  },
  {
    title: "Products",
    path: "/product",
    icon: <Icon icon="fluent-mdl2:product-variant" width="20" height="20" />,
  },
  {
    title: "Orders",
    path: "/orders",
    icon: (
      <Icon icon="material-symbols:orders-outline" width="20" height="20" />
    ),
  },

  {
    title: "Admin",
    path: "/admin",
    icon: <Icon icon="eos-icons:admin-outlined" width="20" height="20" />,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: (
      <Icon icon="material-symbols:settings-outline" width="20" height="20" />
    ),
  },
]
