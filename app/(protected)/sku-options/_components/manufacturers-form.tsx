"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type Manufacturer } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import { parseAsString, useQueryState } from "nuqs"
import { addManufacturer } from "../_lib/actions"
import { toast } from "sonner"

export const ManufacturersForm = ({
  manufacturers,
}: {
  manufacturers: Manufacturer[]
}) => {
  const [manufacturer, setManufacturer] = useQueryState(
    "manufacturer",
    parseAsString.withDefault("")
  )

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manufacturers</CardTitle>
      </CardHeader>
      <CardContent className="w-full flex flex-col justify-start items-start md:items-center md:flex-row gap-4">
        <ul className="list-none flex-row md:flex gap-4">
          {manufacturers.map((manf) => (
            <li
              key={manf.id}
              className="hover:underline cursor-default text-sm font-medium"
            >
              @{manf.name}
            </li>
          ))}
        </ul>
        <div className="flex gap-4 py-2">
          <Input
            id="category"
            type="text"
            className="w-48"
            disabled={isPending}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="MinLength: 3"
            value={manufacturer}
            minLength={3}
            maxLength={20}
            required
          />
          <Button
            variant="default"
            onClick={() => server_addManufacturer(manufacturer)}
            disabled={isPending || manufacturer.trim().length < 2}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
