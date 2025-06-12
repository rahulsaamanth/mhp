"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader, Search } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface SelectedUser {
  id: string
  name: string
  email: string
  phone: string
}

interface UserSearchDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  onUserSelectAction: (user: SelectedUser) => void
}

export function UserSearchDialog({
  open,
  onOpenChangeAction,
  onUserSelectAction,
}: UserSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setUsers([])
    }
  }, [open])

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Set a new timeout to debounce the API call
    searchTimeout.current = setTimeout(() => {
      if (query.length >= 3) {
        fetchUsers(query)
      } else {
        setUsers([])
      }
    }, 300)
  }

  const fetchUsers = async (query: string) => {
    if (query.length < 3) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/users?search=${encodeURIComponent(query)}&pageSize=20`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    const selectedUser: SelectedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    }

    onUserSelectAction(selectedUser)
    onOpenChangeAction(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>

        <div className="flex items-center mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type at least 3 characters to search users..."
            className="pl-9"
            autoFocus
          />
          {isLoading && (
            <Loader className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md">
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}

          {searchQuery.length >= 3 && users.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No users found. Try a different search term.
            </div>
          )}

          {users.length > 0 && (
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-3 cursor-pointer hover:bg-accent"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                    {user.phone && ` • ${user.phone}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
