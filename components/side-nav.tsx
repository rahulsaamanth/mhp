"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SIDENAV_ITEMS } from "@/lib/constants"
import { SideNavItem } from "@/types"
import { Icon } from "@iconify/react"
import Image from "next/image"

const SideNav = () => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)

  const handleToggleSubMenu = (path: string) => {
    setOpenSubMenu(openSubMenu === path ? null : path)
  }

  return (
    <div className="fixed hidden h-screen flex-1 border-r border-zinc-200 bg-white xl:flex lg:w-48 z-50">
      <div className="flex w-full flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex h-16 w-full flex-row items-center justify-center space-x-3 border-b border-zinc-200 md:justify-start md:px-6"
        >
          <span className="hidden text-3xl font-bold md:flex">
            <Image
              src="/logo.jpg"
              alt="failed to load logo : side-nav"
              height={100}
              width={100}
            />
          </span>
        </Link>

        <div className="flex h-5/6 flex-col gap-2 md:px-6">
          {SIDENAV_ITEMS.map((item, idx) => {
            const bottomItems = idx === SIDENAV_ITEMS.length - 2
            return bottomItems ? (
              <div key={idx} className="mt-auto">
                <MenuItem
                  item={item}
                  openSubMenu={openSubMenu}
                  handleToggleSubMenu={handleToggleSubMenu}
                  setOpenSubMenu={setOpenSubMenu}
                />
              </div>
            ) : (
              <MenuItem
                key={idx}
                item={item}
                openSubMenu={openSubMenu}
                setOpenSubMenu={setOpenSubMenu}
                handleToggleSubMenu={handleToggleSubMenu}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SideNav

const MenuItem = ({
  item,
  openSubMenu,
  handleToggleSubMenu,
  setOpenSubMenu,
}: {
  item: SideNavItem
  openSubMenu: string | null
  handleToggleSubMenu: (path: string) => void
  setOpenSubMenu: (path: string | null) => void
}) => {
  const pathname = usePathname()

  return (
    <>
      {item.submenu ? (
        <>
          <button
            onClick={() => handleToggleSubMenu(item.path)}
            className={`flex w-full flex-row items-center justify-between rounded-lg p-2 hover:bg-zinc-200 ${
              pathname.includes(item.path) && "bg-zinc-200"
            }`}
          >
            <div className="flex flex-row items-center space-x-4">
              <Icon icon={item.icon as string} width="20" height="20" />
              <span className="flex text-xl font-medium">{item.title}</span>
            </div>

            <div
              className={`${openSubMenu === item.path ? "rotate-180" : ""} flex`}
            >
              <Icon icon="lucide:chevron-down" width="24" height="24" />
            </div>
          </button>

          {openSubMenu === item.path && (
            <div className="ml-4 flex flex-col space-y-2 border-dashed border-l-2 border-black">
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`flex flex-row items-center space-x-4 rounded-lg p-2 hover:bg-zinc-200 ${
                      subItem.path === pathname && "font-semibold bg-zinc-200"
                    }`}
                  >
                    <Icon
                      icon={subItem.icon as string}
                      width="20"
                      height="20"
                    />
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
          className={`flex flex-row items-center space-x-4 rounded-lg p-2 hover:bg-zinc-200 ${
            item.path === pathname && "bg-zinc-200"
          }`}
          onClick={() => setOpenSubMenu(null)}
        >
          <Icon icon={item.icon as string} width="20" height="20" />
          <span className={`flex text-base font-medium`}>{item.title}</span>
        </Link>
      )}
    </>
  )
}
