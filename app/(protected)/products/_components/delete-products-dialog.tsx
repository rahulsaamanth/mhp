"use client"

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from "react"
import { type Product } from "@/drizzle/schema"
import { type Row } from "@tanstack/react-table"
import { useMediaQuery } from "@/hooks/use-media-query"
import { deleteProducts } from "../_lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react/dist/iconify.js"
import { DialogClose, DialogContent } from "@radix-ui/react-dialog"
import { Loader } from "lucide-react"

interface DeleteProductsDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  products: Row<Product>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export function DeleteProductsDialog({
  products,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteProductsDialogProps) {
  const [isDeletePending, startDeleteTransition] = React.useTransition()
  const isDesktop = useMediaQuery("(min-width: 640px")

  function onDelete() {
    startDeleteTransition(async () => {
      const { error } = await deleteProducts({
        ids: products.map((product) => product.id),
      })

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Products deleted")
      onSuccess?.()
    })
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon
                icon="iconoir:trash"
                width="24"
                height="24"
                style={{ color: "red" }}
              />
              Delete ({products.length})
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your{" "}
              <span className="font-medium">{products.length}</span>
              {products.length === 1 ? " product" : "products"} from our
              database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
}
