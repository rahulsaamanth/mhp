const ProductPage = async ({ params }: { params: { id: string } }) => {
  return <p>Product ID: {params.id}</p>
}

export default ProductPage
