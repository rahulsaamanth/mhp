import { db } from "@/db/db"

import { ProductsForm } from "../_components/product-form"

export default async function createProductPage() {
  const [categories, manufacturers, tags] = await Promise.all([
    db.query.category.findMany(),
    db.query.manufacturer.findMany(),
    db.query.tag.findMany(),
  ])

  const categoryMap = Object.fromEntries(
    categories.map(({ id, name }) => [id, name])
  )

  const formattedCategories = categories
    .map(({ id, name, parentId }) => ({
      id,
      name,
      parentId,
      formattedName: parentId ? `${categoryMap[parentId]}/${name}` : name,
    }))
    .sort((a, b) => a.formattedName.localeCompare(b.formattedName))

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <ProductsForm
          mode="create"
          props={{
            categories: formattedCategories,
            manufacturers,
            tags,
          }}
        />
      </main>
    </div>
  )
}
