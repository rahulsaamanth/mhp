"use client"

import React, { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SIDENAV_ITEMS } from "@/lib/constants"
import { SideNavItem } from "@/types"
import { Icon } from "@iconify/react"

const SideNav = () => {
  return (
    <div className="fixed hidden h-screen flex-1 border-r border-zinc-200 bg-white md:flex md:w-60">
      <div className="flex w-full flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex h-16 w-full flex-row items-center justify-center space-x-3 border-b border-zinc-200 md:justify-start md:px-6"
        >
          <span className="hidden text-3xl font-bold md:flex">Logo</span>
        </Link>

        <div className="flex h-5/6 flex-col gap-2 md:px-6">
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
    </div>
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
            className={`flex w-full flex-row items-center justify-between rounded-lg p-2 hover:bg-zinc-200 ${
              pathname.includes(item.path) && "bg-zinc-200"
            }`}
          >
            <div className="flex flex-row items-center space-x-4">
              <Icon icon={item.icon as string} width="20" height="20" />
              <span className="flex text-xl font-semibold">{item.title}</span>
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
          className={`flex flex-row items-center space-x-4 rounded-lg p-2 hover:bg-zinc-200 hover:outline hover:outline-1 ${
            item.path === pathname && "bg-zinc-200"
          }`}
        >
          <Icon icon={item.icon?.toString()!} width="20" height="20" />

          <span className={`flex text-xl font-semibold`}>{item.title}</span>
        </Link>
      )}
    </>
  )
}
