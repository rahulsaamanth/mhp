import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()
  await prisma.order.deleteMany()
  await prisma.orderDetails.deleteMany()

  // Seed categories, subcategories, brands, and products
  const beautyCategory = await prisma.category.create({
    data: {
      name: "Beauty and Cosmetics",
      subCategories: {
        create: [
          {
            name: "Hair Styling",
            products: {
              create: [
                {
                  name: "Fourrts Hair Grow Gel",
                  description:
                    "Natural Solution for Dandruff, Hair fall & Graying.",
                  price: 245.0,
                  stock: 100,
                  image:
                    "https://homeomart.com/cdn/shop/files/fourrtshairgrogel.jpg?v=1702529883",
                  brand: {
                    create: {
                      name: "Fourrts India Laboratories Pvt. Ltd",
                    },
                  },
                },
              ],
            },
          },
          {
            name: "Moisturizers",
            products: {
              create: [
                {
                  name: "SBL Silk n Stay Aloevera Cream for Natural Glowing Flawless Skin",
                  description:
                    "Silk n Stay Aloe vera cream is a perfect combination of Aloe vera and Calendula herbs which are well known for their moisturizing and healing effect",
                  price: 65.0,
                  stock: 100,
                  image:
                    "https://homeomart.com/cdn/shop/files/Aloveracream_1fe6d33a-6c2e-4ee0-a8a2-5eeb1a82f243.png?v=1696061018",
                  brand: {
                    create: {
                      name: "SBL Pvt. Ltd.",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      subCategories: {
        include: {
          products: true,
        },
      },
    },
  })

  const dietCategory = await prisma.category.create({
    data: {
      name: "Diet and Nutrition",
      subCategories: {
        create: [
          {
            name: "Tonics",
            products: {
              create: [
                {
                  name: "SBL Five Phos A+ Syrup",
                  description: "general weakness, lack of vitality",
                  price: 144.0,
                  stock: 60,
                  image:
                    "https://homeomart.com/cdn/shop/files/FivephosA.png?v=1695381798",
                  brand: {
                    create: {
                      name: "SBL Pvt. Ltd.",
                    },
                  },
                },
              ],
            },
          },
          {
            name: "Dietary Supplements",
            products: {
              create: [
                {
                  name: "SBL Alfalfa Tonic with Ginseng",
                  description: "Revitalize Your Energy & Enhance Appetite",
                  price: 95.0,
                  stock: 30,
                  image:
                    "https://homeomart.com/cdn/shop/files/Alfalfatonic.png?v=1695302448",
                  brand: {
                    create: {
                      name: "SBL Pvt. Ltd.",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      subCategories: {
        include: {
          products: true,
        },
      },
    },
  })

  // Fetch products for orders
  const hairGrowGel = await prisma.product.findFirst({
    where: { name: "Fourrts Hair Grow Gel" },
  })
  const aloeveraCream = await prisma.product.findFirst({
    where: {
      name: "SBL Silk n Stay Aloevera Cream for Natural Glowing Flawless Skin",
    },
  })
  const fivePhosSyrup = await prisma.product.findFirst({
    where: { name: "SBL Five Phos A+ Syrup" },
  })
  const alfalfaTonic = await prisma.product.findFirst({
    where: { name: "SBL Alfalfa Tonic with Ginseng" },
  })

  // Create users with orders and order details
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      role: "USER",
      status: "ACTIVE",
      isTwoFactorEnabled: false,
      orders: {
        create: [
          {
            orderDate: new Date(),
            totalAmountPaid: 389.0, // sum of product prices in the order
            orderDetails: {
              create: [
                {
                  product: { connect: { id: hairGrowGel!.id } },
                  quantity: 1,
                  unitPrice: hairGrowGel!.price,
                },
                {
                  product: { connect: { id: aloeveraCream!.id } },
                  quantity: 1,
                  unitPrice: aloeveraCream!.price,
                },
              ],
            },
          },
        ],
      },
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "password123",
      role: "ADMIN",
      status: "ACTIVE",
      isTwoFactorEnabled: true,
      orders: {
        create: [
          {
            orderDate: new Date(),
            totalAmountPaid: 239.0, // sum of product prices in the order
            orderDetails: {
              create: [
                {
                  product: { connect: { id: fivePhosSyrup!.id } },
                  quantity: 1,
                  unitPrice: fivePhosSyrup!.price,
                },
                {
                  product: { connect: { id: alfalfaTonic!.id } },
                  quantity: 1,
                  unitPrice: alfalfaTonic!.price,
                },
              ],
            },
          },
        ],
      },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
