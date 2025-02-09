import { db } from "@/db/db"
import { CategoriesForm } from "./_components/categories-form"
import { isNotNull, isNull } from "drizzle-orm"
import { category } from "@/db/schema"

export default async function SkuOptionsPage() {
  const categories = await db.query.category.findMany()

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
    <div>
      <CategoriesForm categories={formattedCategories} />
    </div>
  )
}
