"use client"

import React, { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SIDENAV_ITEMS } from "@/lib/constants"
import { SideNavItem } from "@/types"
import { Icon } from "@iconify/react"

const SideNav = () => {
  return (
    <aside className="md:w-60 bg-white h-screen flex-1 fixed border-r border-zinc-200 hidden md:flex">
      <div className="flex flex-col gap-6 w-full">
        <Link
          href="/dashboard"
          className="flex flex-row space-x-3 items-center justify-center md:justify-start md:px-6 border-b border-zinc-200 h-16 w-full"
        >
          <span className="font-bold text-xl hidden md:flex">Logo</span>
        </Link>

        <div className="flex flex-col gap-2 md:px-6 h-5/6">
          {SIDENAV_ITEMS.map((item, idx) => {
            const bottomItems = idx === SIDENAV_ITEMS.length - 2
            return bottomItems ? (
              <div key={idx} className="mt-auto">
                <MenuItem item={item} />
              </div>
            ) : (
              <MenuItem key={idx} item={item} />
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default SideNav

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname()
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen)
  }

  return (
    <>
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg w-full justify-between hover:bg-zinc-200 ${
              pathname.includes(item.path) && "bg-zinc-200"
            }`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {item.icon}
              <span className="font-semibold text-xl flex">{item.title}</span>
            </div>

            <div className={`${subMenuOpen ? "rotate-180" : ""} flex`}>
              <Icon icon="lucide:chevron-down" width="24" height="24" />
            </div>
          </button>

          {subMenuOpen && (
            <div className="my-2 ml-12 flex flex-col space-y-4">
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`${
                      subItem.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-zinc-200 ${
            item.path === pathname && "bg-zinc-200"
          }`}
        >
          {item.icon}
          <span className={`text-xl font-semibold flex`}>{item.title}</span>
        </Link>
      )}
    </>
  )
}
