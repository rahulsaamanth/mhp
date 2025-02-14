"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type Manufacturer } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import { parseAsString, useQueryState } from "nuqs"
import { addManufacturer, deleteManufacturer } from "../_lib/actions"
import { toast } from "sonner"
import { CircleX, Loader } from "lucide-react"
import { useState } from "react"

export const ManufacturersForm = ({
  manufacturers,
}: {
  manufacturers: Manufacturer[]
}) => {
  const [manufacturer, setManufacturer] = useQueryState(
    "manufacturer",
    parseAsString.withDefault("")
  )

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { mutate: server_addManufacturer, isPending } = useMutation({
    mutationFn: addManufacturer,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `${data.manufacturer?.name} manufacturer created successfully`
        )
        setManufacturer("")
      }
      if (data.error) toast.error(data.error || "Failed to create manufacturer")
    },

    onError: (error) => {
      toast.error("Something went wrong!")
      console.error("Error creating manufacturer:", error)
    },
  })

  const { mutate: server_deleteManufacturer } = useMutation({
    mutationFn: deleteManufacturer,
    onSuccess: (data) => {
      setDeletingId(null)
      if (data.success)
        toast.success(
          `${data.manufacturer?.name} manufacturer deleted successfully`
        )
      if (data.error) toast.error(data.error || "Failed to delete manufacturer")
    },
    onError: (error) => {
      setDeletingId(null)
      toast.error("Something went wrong!")
      console.error("Error deleting manufacturer:", error)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manufacturers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-full max-h-[200px] overflow-y-auto border rounded-md">
          {manufacturers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
              {manufacturers.map((manf) => (
                <div
                  key={manf.id}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/50 rounded-md"
                >
                  <span className="text-sm font-medium truncate">
                    @{manf.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setDeletingId(manf.id)
                      server_deleteManufacturer(manf.id)
                    }}
                    disabled={deletingId === manf.id}
                  >
                    {deletingId === manf.id ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <CircleX className="h-3 w-3 text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              No manufacturers found
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <Input
            id="manufacturer"
            type="text"
            className="w-48"
            disabled={isPending}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="MinLength: 3"
            value={manufacturer}
            minLength={3}
            maxLength={40}
            required
          />
          <Button
            variant="default"
            onClick={() => server_addManufacturer(manufacturer)}
            disabled={isPending || manufacturer.trim().length < 2}
          >
            {isPending ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
