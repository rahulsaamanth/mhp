import { PrismaClient, UserRole, UserStatus } from "@prisma/client"

const prisma = new PrismaClient()

function getRandomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
}

async function main() {
  // Clear existing data
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
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
                  price: 245.75,
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
                  price: 65.5,
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
                  price: 144.5,
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
                  price: 95.25,
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

  // admin
  await prisma.user.create({
    data: {
      name: "rahulsaamanth",
      email: "rahulsaamanth@yahoo.com",
      password: "$2a$10$j2ySX/mFMSBGfMbQDgC4JugQkVFjWHp7dqiRuY2d6uGQjPC8T5bWi",
      role: "ADMIN",
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
      image:
        "https://next-auth.s3.ap-south-1.amazonaws.com/325031b37240e69fde1888d4c25ec75780687e1939c31894c59597686b17ddd4",
    },
  })

  // user-1
  await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      role: "USER",
      phone: "+91 9700899273",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
      orders: {
        create: [
          {
            orderDate: new Date(),
            totalAmountPaid: 311.25, // sum of product prices in the order
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
      createdAt: getRandomDate(new Date(2024, 2, 1), new Date(2024, 5, 1)),
    },
  })

  //user-2
  await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "password123",
      role: "USER",
      phone: "+91 7993174492",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: true,
      orders: {
        create: [
          {
            orderDate: new Date(),
            totalAmountPaid: 239.55, // sum of product prices in the order
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
      createdAt: getRandomDate(new Date(2024, 2, 1), new Date(2024, 5, 1)),
    },
  })

  //user-3
  await prisma.user.create({
    data: {
      name: "Ab dev",
      email: "ab.dev@example.com",
      password: "password123",
      role: "USER",
      phone: "+91 9866575562",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
  })
  const dummyUsers = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456791",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Bob Brown",
      email: "bob.brown@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456792",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Charlie Davis",
      email: "charlie.davis@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456793",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Dave Wilson",
      email: "dave.wilson@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456794",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Eve Martinez",
      email: "eve.martinez@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456795",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Frank Clark",
      email: "frank.clark@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456796",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Grace Lewis",
      email: "grace.lewis@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456797",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Hank Walker",
      email: "hank.walker@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456798",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Ivy Hall",
      email: "ivy.hall@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456799",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Jack King",
      email: "jack.king@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456700",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Kara Wright",
      email: "kara.wright@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456701",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Liam Scott",
      email: "liam.scott@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456702",
      status: UserStatus.INACTIVE,
      createdAt: new Date(2022, 8, 3),
      isTwoFactorEnabled: false,
    },
    {
      name: "Mia Young",
      email: "mia.young@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456703",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Noah Green",
      email: "noah.green@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456704",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Olivia Adams",
      email: "olivia.adams@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456705",
      status: UserStatus.INACTIVE,
      createdAt: new Date(2022, 10, 10),
      isTwoFactorEnabled: false,
    },
    {
      name: "Paul Nelson",
      email: "paul.nelson@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456706",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Quincy Baker",
      email: "quincy.baker@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456707",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
    {
      name: "Ruby Perez",
      email: "ruby.perez@example.com",
      password: "password123",
      role: UserRole.USER,
      phone: "+91 9123456708",
      status: UserStatus.ACTIVE,
      isTwoFactorEnabled: false,
    },
  ]

  for (const user of dummyUsers) {
    !user.createdAt
      ? await prisma.user.create({
          data: {
            ...user,
            createdAt: getRandomDate(
              new Date(2024, 2, 1),
              new Date(2024, 5, 1),
            ),
          },
        })
      : await prisma.user.create({
          data: {
            ...user,
          },
        })
  }
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
