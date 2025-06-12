"use client"

import React, { useState, useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteDiscountCode } from "../_lib/actions"

interface DeleteDiscountCodeDialogProps {
  discountCodeId: string
  discountCodeName: string
}

export function DeleteDiscountCodeDialog({
  discountCodeId,
  discountCodeName,
}: DeleteDiscountCodeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteDiscountCode(discountCodeId)
        if (result.success) {
          toast.success("Discount code deleted successfully")
          setOpen(false)
        } else {
          toast.error(result.error || "Failed to delete discount code")
        }
      } catch (error) {
        console.error("Error deleting discount code:", error)
        toast.error("An unexpected error occurred")
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Discount Code</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the discount code{" "}
            <span className="font-medium">{discountCodeName}</span>?
            <br />
            <br />
            This action cannot be undone. If the discount code is currently in
            use by any orders, it cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
