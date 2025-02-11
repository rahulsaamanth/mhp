"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { CircleX, Loader } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"
import { addCategory, addSubCategory, deleteCategory } from "../_lib/actions"

type Category = {
  id: string
  name: string
  subCategories: string[]
}

type RawCategories = {
  id: string
  name: string
  parentId: string | null
}

export const CategoriesForm = ({
  categories,
  rawCategories,
}: {
  categories: Category[]
  rawCategories: RawCategories[]
}) => {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("")
  )
  const [subCategory, setSubCategory] = useQueryState(
    "subCategory",
    parseAsString.withDefault("")
  )

  const { mutate: server_addCategory, isPending } = useMutation({
    mutationFn: addCategory,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `${data.category?.name.toUpperCase()} category created successfully`
        )
        setCategory("")
      }
      if (data.error) toast.error(data.error || "Failed to create category")
    },

    onError: (error) => {
      toast.error("Something went wrong!")
      console.error("Error creating category:", error)
    },
  })

  const { mutate: server_addSubCategory, isPending: subIsPending } =
    useMutation({
      mutationFn: addSubCategory,
      onSuccess: (data) => {
        if (data.success) {
          toast.success(
            `${data.category?.name.toUpperCase()} subcategory created successfully`
          )
          setSubCategory("")
        }
        if (data.error)
          toast.error(data.error || "Failed to create sub category")
      },

      onError: (error) => {
        toast.error("Something went wrong!")
        console.error("Error creating category:", error)
      },
    })

  const { mutate: server_deleteCategory, isPending: deleteIsPending } =
    useMutation({
      mutationFn: deleteCategory,
      onSuccess: (data) => {
        if (data.success)
          toast.success(
            `${data.category?.name.toUpperCase()} deleted successfully`
          )
        if (data.error) toast.error(data.error || "Failed to delete category")
      },
      onError: (error) => {
        toast.error("Something went wrong!")
        console.error("Error deleting category:", error)
      },
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Hover to add subcategories</CardDescription>
      </CardHeader>
      <CardContent className="w-full flex flex-col justify-start items-start md:flex-row">
        {categories.map((cat) => (
          <HoverCard key={cat.id}>
            <HoverCardTrigger asChild>
              <Button variant="link">@{cat.name}</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-4">
              {cat.subCategories.length > 0 ? (
                <ul className="list-none space-y-2">
                  {cat.subCategories.map((subCat, idx) => (
                    <li key={idx}>
                      - @{subCat}{" "}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const subToDelete = rawCategories.find(
                            (category) =>
                              category.parentId === cat.id &&
                              category.name === subCat
                          )
                          if (subToDelete)
                            server_deleteCategory(subToDelete?.id)
                          else toast.error("SubCategory not found")
                        }}
                      >
                        {deleteIsPending && (
                          <Loader className="size-4 animate-spin" />
                        )}
                        <CircleX className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span>------No subcategories------</span>
              )}
              <div className="flex gap-4 py-2">
                <Input
                  id="category"
                  type="text"
                  className="w-full"
                  disabled={subIsPending}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="MinLength: 3"
                  value={subCategory}
                  minLength={4}
                  maxLength={20}
                  required
                />
                <Button
                  variant="default"
                  onClick={() =>
                    server_addSubCategory({ id: cat.id, name: subCategory })
                  }
                  disabled={subIsPending || subCategory.trim().length < 2}
                >
                  Add
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
        <div className="flex gap-4">
          <Input
            id="category"
            type="text"
            className="w-48"
            onChange={(e) => setCategory(e.target.value)}
            placeholder="MinLength: 3"
            value={category}
            minLength={4}
            maxLength={20}
            required
          />
          <Button
            variant="default"
            disabled={isPending || category.trim().length < 2}
            onClick={() => server_addCategory(category)}
          >
            {isPending && <Loader className="size-4 animate-spin" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
