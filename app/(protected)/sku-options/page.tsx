import { db } from "@/db/db"
import { CategoriesForm } from "./_components/categories-form"
import { ManufacturersForm } from "./_components/manufacturers-form"

export default async function SkuOptionsPage() {
  const [categories, manufacturers] = await Promise.all([
    db.query.category.findMany(),
    db.query.manufacturer.findMany(),
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
    </>
  )
}
