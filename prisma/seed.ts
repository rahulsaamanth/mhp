import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()

  await prisma.category.create({
    data: {
      name: "Beauty and Cosmitics",
      subCategories: {
        create: [
          {
            name: "Hair Styling",
            products: {
              create: [
                {
                  name: "Fourrts Hair gorw gel",
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
                  name: "SBL Silk n Stay Aloevera Cream for Natrual Glowing Flawless Skin",
                  description:
                    "Silk n Stay Aloe vera cream is a perfect combination of Aloe vera and Calendula herbs which are well known for their moisturizing and healing effect",
                  price: 65.0,
                  image:
                    "https://homeomart.com/cdn/shop/files/Aloveracream_1fe6d33a-6c2e-4ee0-a8a2-5eeb1a82f243.png?v=1696061018",
                  stock: 100,
                  brand: {
                    create: {
                      name: "SBL Pvt. Ltm.",
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
  await prisma.category.create({
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
                      name: "SBL Pvt. Lmt.",
                    },
                  },
                },
              ],
            },
          },
          {
            name: "Dietary Suppliments",
            products: {
              create: [
                {
                  name: "SBL Alfalfa Tonic with Ginseng",
                  description: "Revitalize Your Energy & Enhance Appetile",
                  price: 95.0,
                  image:
                    "https://homeomart.com/cdn/shop/files/Alfalfatonic.png?v=1695302448",
                  stock: 30,
                  brand: {
                    create: {
                      name: "SBL Pvt. Ltm.",
                    },
                  },
                  properties: {
                    test: "Testing! properties JSON",
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
