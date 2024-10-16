import { db } from "@/drizzle/db"
import { product } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const productDetails = await db.query.product.findFirst({
    where: eq(product.id, params.id),
    with: {
      category: true,
      manufacturer: true,
      variants: true,
    },
  })
  console.log(productDetails)
  if (!productDetails) {
    return <p className="text-center text-red-500">Product not found</p>
  }

  const {
    name,
    description,
    image,
    tags,
    category,
    manufacturer,
    variants,
    properties,
  } = productDetails

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{name}</h1>

      <p className="mb-6 text-gray-700">
        <strong>Description: </strong>
        {description}
      </p>

      {image && image.length > 0 && (
        <div className="mb-6">
          <strong className="block text-gray-700 mb-2">Image:</strong>
          <img
            src={image[0]}
            alt={name}
            className="w-full max-w-xs object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="mb-4">
        <strong className="text-gray-700">Category: </strong>
        <span>{category?.name || "N/A"}</span>
      </div>

      <div className="mb-4">
        <strong className="text-gray-700">Manufacturer: </strong>
        <span>{manufacturer?.name || "N/A"}</span>
      </div>

      <div className="mb-4">
        <strong className="text-gray-700">Tags: </strong>
        <ul className="list-disc pl-5">
          {tags?.map((tag: string) => (
            <li key={tag} className="text-gray-600">
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {properties!! && Object.keys(properties).length > 0 && (
        <div className="mb-6">
          <strong className="text-gray-700">Properties:</strong>
          <ul className="list-disc pl-5 mt-2">
            {Object.entries(properties).map(([key, value]) => (
              <li key={key} className="text-gray-600">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <strong className="text-gray-700">Variants:</strong>
        {variants && variants.length > 0 ? (
          <ul className="list-disc pl-5 mt-2">
            {variants.map((variant: any) => (
              <li key={variant.id} className="text-gray-600">
                <strong>{variant.variantName}: </strong> ₹{variant.price}{" "}
                (Stock: {variant.stock})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No variants available.</p>
        )}
      </div>
    </div>
  )
}

export default ProductPage
