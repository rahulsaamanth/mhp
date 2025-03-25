import { db } from "@/db/db"
import { CategoriesForm } from "./_components/categories-form"
import { ManufacturersForm } from "./_components/manufacturers-form"
import { getCategories, getManufacturers, getTags } from "./_lib/queries"
import { TagsForm } from "./_components/tags-form"
export const runtime = "edge"

export default async function SkuOptionsPage() {
  const [categories, manufacturers, tags] = await Promise.all([
    getCategories(),
    getManufacturers(),
    getTags(),
  ])

  const formattedCategories = categories
    .filter((cat) => cat.parentId === null)
    .map((parent) => ({
      id: parent.id,
      name: parent.name,
      subCategories: categories
        .filter((cat) => cat.parentId === parent.id)
        .map((sub) => sub.name),
    }))

  return (
    <>
      <CategoriesForm
        categories={formattedCategories}
        rawCategories={categories}
      />
      <ManufacturersForm manufacturers={manufacturers} />
      <TagsForm tags={tags} />
    </>
  )
}
