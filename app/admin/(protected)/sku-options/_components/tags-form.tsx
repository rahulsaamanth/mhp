"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tag } from "@/db/schema"
import { useMutation } from "@tanstack/react-query"
import { CircleX, Loader } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import { useState } from "react"
import { toast } from "sonner"
import { addTag, deleteTag } from "../_lib/actions"

export const TagsForm = ({ tags }: { tags: Tag[] }) => {
  const [tag, setTag] = useQueryState("tag", parseAsString.withDefault(""))

  const [deletingId, setDeletingId] = useState<null | string>(null)

  const { mutate: server_addTag, isPending } = useMutation({
    mutationFn: addTag,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${data.tag?.name} tag created successfully`)
        setTag("")
      }
      if (data.error) toast.error(data.error || "Failed to create tag")
    },

    onError: (error) => {
      toast.error("Something went wrong!")
      console.error("Error creating tag:", error)
    },
  })

  const { mutate: server_deleteTag } = useMutation({
    mutationFn: deleteTag,
    onSuccess: (data) => {
      setDeletingId(null)
      if (data.success)
        toast.success(`${data.tag?.name} tag deleted successfully`)
      if (data.error) toast.error(data.error || "Failed to delete tag")
    },
    onError: (error) => {
      setDeletingId(null)
      toast.error("Something went wrong!")
      console.error("Error deleting tag:", error)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-full max-h-[200px] overflow-y-auto border rounded-md">
          {tags.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
              {tags.map((manf) => (
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
                      server_deleteTag(manf.id)
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
              No Tags found
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <Input
            id="tag"
            type="text"
            className="w-48"
            disabled={isPending}
            onChange={(e) => setTag(e.target.value)}
            placeholder="MinLength: 3"
            value={tag}
            minLength={3}
            maxLength={40}
            required
          />
          <Button
            variant="default"
            onClick={() => server_addTag(tag)}
            disabled={isPending || tag.trim().length < 2}
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
