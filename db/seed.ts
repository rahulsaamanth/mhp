import { hashPassword } from "@/lib/passwords"
import { db } from "./db"
import * as schema from "@rahulsaamanth/mhp-schema"
import { eq } from "drizzle-orm"

async function seed() {
  console.log("🌱 Seeding started...")

  // await db.delete(schema.review)
  await db.delete(schema.payment)
  await db.delete(schema.orderDetails)
  await db.delete(schema.order)
  await db.delete(schema.productInventory)
  await db.delete(schema.product)
  await db.delete(schema.category)
  await db.delete(schema.manufacturer)
  await db.delete(schema.store)
  await db.delete(schema.tag)
  await db.delete(schema.twoFactorConfirmation)
  await db.delete(schema.account)
  await db.delete(schema.user)
  await db.delete(schema.address)
  await db.delete(schema.productVariant)
  // await db.delete(schema.paymentMethod)

  const hashedPassword = await hashPassword("password123")

  const adminPassword = await hashPassword("Awavauatsh")

  const users = await db
    .insert(schema.user)
    .values([
      {
        name: "John Doe",
        email: "john@example.com",
        emailVerified: new Date(),
        password: hashedPassword,
        role: "USER",
        lastActive: new Date(),
        phone: "+1234567890",
        isTwoFactorEnabled: false,
        image: "",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: new Date(),
        password: hashedPassword,
        role: "USER",
        lastActive: new Date(),
        phone: "+1122334455",
        isTwoFactorEnabled: false,
        image: "",
      },
      {
        name: "Michael Johnson",
        email: "michael@example.com",
        emailVerified: new Date(),
        password: hashedPassword,
        role: "USER",
        lastActive: new Date(),
        phone: "+9988776655",
        isTwoFactorEnabled: true,
        image: "",
      },
      {
        name: "Emily Davis",
        email: "emily@example.com",
        emailVerified: new Date(),
        password: hashedPassword,
        role: "USER",
        lastActive: new Date(),
        phone: "+5544332211",
        isTwoFactorEnabled: false,
        image: "",
      },
      {
        name: "David Wilson",
        email: "david@example.com",
        emailVerified: new Date(),
        password: hashedPassword,
        role: "USER",
        lastActive: new Date(),
        phone: "+6677889900",
        isTwoFactorEnabled: true,
        image: "",
      },
      {
        name: "Rahul Saamanth",
        email: "rahulsaamanth@yahoo.com",
        emailVerified: new Date(),
        password: adminPassword,
        role: "ADMIN",
        lastActive: new Date(),
        isTwoFactorEnabled: false,
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQG8JpG77J0Waw/profile-displayphoto-shrink_400_400/B56ZUPc4oDGQAg-/0/1739720985620?e=1746057600&v=beta&t=x61CfV22Yv08gMjpAXsU3oHTqAGZSGJhWM_lfRjLwe0",
      },
    ])
    .returning()

  const addresses = await db
    .insert(schema.address)
    .values([
      {
        userId: users[0]?.id!,
        street: "J street",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        postalCode: "560067",
      },
      {
        userId: users[1]?.id!,
        street: "K street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400076",
      },
      {
        userId: users[2]?.id!,
        street: "123 Tech Lane",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        postalCode: "500072",
      },
      {
        userId: users[3]?.id!,
        street: "456 Green Road",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        postalCode: "411001",
      },
      {
        userId: users[4]?.id!,
        street: "789 Health Avenue",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        postalCode: "600001",
      },
    ])
    .returning()

  // const mainCategories = await db
  //   .insert(schema.category)
  //   .values([
  //     { name: "Homeopathy" },
  //     { name: "Nutrition-Supplements" },
  //     { name: "Babycare" },
  //   ])
  //   .returning()

  // const subCategories = await db
  //   .insert(schema.category)
  //   .values([
  //     { name: "Biochemics", parentId: mainCategories[0]?.id },
  //     { name: "Biocombinations", parentId: mainCategories[0]?.id },
  //     { name: "Dilutions", parentId: mainCategories[0]?.id },
  //     { name: "Mothertinctures", parentId: mainCategories[0]?.id },
  //   ])
  //   .returning()

  const mainCategories = await db
    .insert(schema.category)
    .values([
      {
        name: "Homeopathy",
        path: "/homeopathy",
        pathIds: [],
        depth: 0,
      },
      {
        name: "Nutrition-Supplements",
        path: "/nutrition_supplements",
        pathIds: [],
        depth: 0,
      },
      {
        name: "Personal-Care",
        path: "/personal-care",
        pathIds: [],
        depth: 0,
      },
    ])
    .returning()

  for (const category of mainCategories) {
    await db
      .update(schema.category)
      .set({ pathIds: [category.id] })
      .where(eq(schema.category.id, category.id))
  }

  const subCategories = await db
    .insert(schema.category)
    .values([
      {
        name: "Biochemics",
        parentId: mainCategories[0]?.id!,
        path: "/homeopathy/biochemics/",
        pathIds: [mainCategories[0]?.id!],
        depth: 1,
      },
      {
        name: "Biocombinations",
        parentId: mainCategories[0]?.id!,
        path: "/homeopathy/biocombinations/",
        pathIds: [mainCategories[0]?.id!],
        depth: 1,
      },
      {
        name: "Dilutions",
        parentId: mainCategories[0]?.id!,
        path: "/homeopathy/dilutions/",
        pathIds: [mainCategories[0]?.id!],
        depth: 1,
      },
      {
        name: "Mothertinctures",
        parentId: mainCategories[0]?.id!,
        path: "/homeopathy/mothertinctures/",
        pathIds: [mainCategories[0]?.id!],
        depth: 1,
      },
    ])
    .returning()

  for (const category of subCategories) {
    await db
      .update(schema.category)
      .set({
        pathIds: [...(category.pathIds || []), category.id],
      })
      .where(eq(schema.category.id, category.id))
  }

  const manufacturers = await db
    .insert(schema.manufacturer)
    .values([
      { name: "SBLhomeopahty" },
      { name: "DrReckeweg(Germany)" },
      { name: "WillmarSchwabeIndia" },
      { name: "Backson" },
      { name: "Hapdco" },
      { name: "Allen" },
      { name: "Adven" },
    ])
    .returning()

  const stores = await db
    .insert(schema.store)
    .values([
      {
        name: "Mangalore Store 1",
        code: "MANGALORE-01",
        location: "Mangalore, Karnataka",
        isActive: true,
      },
      {
        name: "Mangalore Store 2",
        code: "MANGALORE-02",
        location: "Mangalore, Karnataka",
        isActive: true,
      },
      {
        name: "Kerala Store 1",
        code: "KERALA-01",
        location: "Kochi, Kerala",
        isActive: true,
      },
    ])
    .returning()

  const products = await db
    .insert(schema.product)
    .values([
      {
        name: "Dr. Reckeweg Silicea",
        description:
          "Reckeweg Silicea tablet is well known as a tissue salt to ripen infections and remove them through the surface. It acts as a blood cleanser and is useful in abscesses, tonsillitis, styes and other infections to promote the formation of pus when an outlet is available. When it is lacking, the nails, hair and bones may become weak. Weakness and poor stamina may be evident in other parts of the body.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Biochemic", "Dr. Reckeweg"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Dr. Reckeweg Natrum Sulphuricum",
        description:
          "Natrum sulphuricum regulates the distribution of water and the flow of bile. It removes the excess of water from the blood. It keeps the bile in normal consistency. Natrum sulph is the water removing tissue salt. It helpful for water retention that takes place in the body. An imbalance of sodium sulphate produces edema in the tissues, dry skin with watery eruptions.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Dr. Reckeweg"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Dr. Reckeweg Magnesia Phosphoricum",
        description:
          "Phosphate of Magnesia is contained in blood-corpuscles, muscles, brain, spinal marrow, nerves, teeth. Disturbance of its molecules results in pains, cramps, paralysis. Magnesia Phosphorica makes up white matter of muscles and nerve. Mag phos is a mineral supplement to restore energy and begin the regeneration of the bodyâ€™s nerves and muscles. A nutrition and functional remedy for nerve tissues.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Dr. Reckeweg"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Silicea",
        description:
          "Silicea is well known as a tissue salt to ripen infections and removes them through the surface. It acts as a blood cleanser and is useful in abscesses, tonsillitis, styes and other infections to promote the formation of pus when an outlet is available. When it is lacking, the nails, hair and bones may become weak. Weakness and poor stamina may be evident in other parts of the body.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Natrum Sulphuricum",
        description:
          "Natrum sulph regulates the distribution of water and the flow of bile. It removes the excess of water from the blood. It keeps the bile in normal consistency. Natrum sulph is the water removing tissue salt.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Natrum Muriaticum",
        description:
          "It is a mineral with an affinity for fluids, and as it is in nature so it is in the body. It is found predominantly in the extracellular fluids, in striking contrast with the potassium salts.",
        form: "BIO_CHEMIC",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Bio Combination 10 Enlarged Tonsils",
        description:
          "BC 10- Enlarged Tonsils Composition of SBL Bio Combination 10 Calcarea phosphorica â€“ 3x Kalium muriaticum â€“ 3x Ferrum phosphoricum â€“ 3x Indications of SBL Bio Combination 10",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Bio Combination 11 Pyrexia",
        description:
          "BC 11- Pyrexia Composition of  SBL Bio Combination 11 Ferrum phosphoricum 3X Kali muriaticum Kali sulphuricum 3X Natrum muriaticum 3X",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Bio Combination 12 Headache",
        description:
          "BC 12- Headache Composition of  SBL Bio Combination 12 Ferrum phosphoricum 3x, Kalium phosphoricum 3x, Magnesia phosphorica 3x,Natrum muriaticum 3x.",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Dr. Reckeweg Bio Combination 1 Anaemla",
        description:
          "BC 1- Anaemia Composition of Dr. Reckeweg Bio Combination 1 Calcarea Phosphorica 3x Ferrum Phosphoricum 3x Natrum Muriaticum 6x Kalium Phosphoricum 3x Indications of Dr. Reckeweg Bio Combination 1 Lack of blood or loss of blood from any part of the body General Wasting of tissues Waxy appearance of  Mental Depression, Worry, Physical Exhaustion, Weakness Poor digestion in children.",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Dr. Reckeweg Bio Combination 2 Asthama",
        description:
          "BC 2- For breathing problems Composition of Dr. Reckeweg Bio Combination 2 Magnesia -3x Natrum sulphuricum -3x Natrum muriaticum -3x Kalium phosphoricum -3x",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Dr. Reckeweg Bio Combination 3 Colic",
        description:
          "BC 3- Colic Composition of Dr. Reckeweg Bio Combination 3 Magnesia phosphoricum 3x Natrum sulphuricum 3x Calcarea phosphorica 3x Ferrum phosphoricum 3x",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[1]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Willmar Schwabe India Bio Combination 20 Skin Diseases",
        description:
          "BC 20- Skin Diseases. Composition of Willmar Schwabe Bio Combination 20 Calcarea fluorica - 6x Calcarea sulphurica - 6x Natrum muriaticum - 6x Kalium sulphuricum - 3x",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "Willmar Schwabe"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[2]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Willmar Schwabe India Bio Combination 21 Teething Trouble",
        description:
          "BC 21- Teething Troubles Composition of Willmar Schwabe Bio Combination 21 Ferrum phosphoricum â€“ 3x Calcarea phosphorica â€“ 3x Indications of Willmar Schwabe Bio Combination 21 Tardy dentition.",
        form: "BIO_COMBINATION",
        unit: "TABLETS",
        tags: ["medicine", "homeopathy", "Bio combination", "Willmar Schwabe"],
        categoryId: subCategories[1]?.id!,
        manufacturerId: manufacturers[2]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Abel Moschus",
        description:
          "SBL Abel Moschus (Dilution) Also known as: Abel, Abel mosc, Abe mosch | Common Name: Musk mallow | Other Name: Hibiscus Abelmoschus | Potency: 30 CH | Weight: 82 gms | Dimensions: 3.5 cm x 3.5 cm x 9.5 cm.",
        form: "DILUTIONS(P)",
        unit: "ML",
        tags: ["medicine", "homeopathy", "Dilutions", "SBL"],
        categoryId: subCategories[2]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "SBL Abel Moschus",
        description:
          "SBL Abel Moschus (Mother Tincture) Common Name: Musk mallow | Other Name: Hibiscus Abelmoschus Causes & Symptoms: Sleepiness, dysphagia, oedema of hands and legs.",
        form: "MOTHER_TINCTURES(Q)",
        unit: "ML",
        tags: ["medicine", "homeopathy", "Mother Tinctures", "SBL"],
        categoryId: subCategories[3]?.id!,
        manufacturerId: manufacturers[0]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Bakson Acne Aid (Twin Pack)",
        description:
          "Hypoallergic & Anti-comedogenic action.Controls excessive sebum accumulation.Provides flawless skin.",
        form: "CREAM",
        unit: "GM(s)",
        tags: ["PersonalCare", "Face", "homeopathy", "Cosmetics", "Backson"],
        categoryId: subCategories[3]?.id!,
        manufacturerId: manufacturers[3]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Bakson sunny hair removal cream",
        description:
          "For pain free, gentle removal of unwanted hair and beautiful skin.",
        form: "CREAM",
        unit: "GM(s)",
        tags: ["PersonalCare", "Hair", "homeopathy", "Cosmetics", "Bakson"],
        categoryId: subCategories[3]?.id!,
        manufacturerId: manufacturers[3]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Hapdco Nokrack Cream",
        description: "For cracked heels, chaped hands and dry skin.",
        form: "CREAM",
        unit: "GM(s)",
        tags: ["PersonalCare", "Foot", "homeopathy", "Cosmetics", "Hapdco"],
        categoryId: subCategories[3]?.id!,
        manufacturerId: manufacturers[4]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Allen Immunity Booster Tablet",
        description:
          "Allen Immunity Booster Tablet is a homeopathic tablet that helps boost the bodyâ€™s defense mechanism and helps combat various bacteria or viruses that cause diseases. It helps in maintaining general wellness. It helps to build stamina. It can also be used to manage common cold, cough or flu. It has no side effects . Pregnant women should consult a physician before taking this medicine.",
        form: "TABLETS",
        unit: "TABLETS",
        tags: [
          "Nutrition-Suplements",
          "homeopathy",
          "Immunity Booster",
          "Allen",
        ],
        categoryId: mainCategories[1]?.id!,
        manufacturerId: manufacturers[5]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Allen Multi Vitamins",
        description:
          "There are a lot of good reasons to take multivitamin supplements. Even the best eating plans can fall short of meeting all of the 40 plus nutrients you need each day. Many fail to meet dietary recommendations for many reasons, including strict dieting, poor appetite, changing nutritional needs or less than healthy food choices.",
        form: "TABLETS",
        unit: "TABLETS",
        tags: ["Nutrition-Suplements", "homeopathy", "Multi-Vitamins", "Allen"],
        categoryId: mainCategories[1]?.id!,
        manufacturerId: manufacturers[5]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
      {
        name: "Adven Babyson Drops",
        description:
          "Adven Babyson Drops is a well-balanced tonic for children. This product helps to improve the appetite and helps in the overall growth. It promotes better assimilation of calcium, iron, phosphorus, and potassium.",
        form: "DROPS",
        unit: "ML",
        tags: ["Baby Care", "homeopathy", "Babyson Drops", "Adven"],
        categoryId: mainCategories[2]?.id!,
        manufacturerId: manufacturers[6]?.id!,
        tax: 12, // Add tax percentage
        status: "ACTIVE",
      },
    ])
    .returning()

  const productVariants = await db
    .insert(schema.productVariant)
    .values([
      {
        productId: products[0]?.id!,
        sku: "DR-SIL-3X-20T",
        variantName: "Silicea - 3X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRS-3X-20-1",
        ],
        packSize: 20,
        potency: "3X",
        costPrice: 120,
        mrp: 150,
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[0]?.id!,
        sku: "DR-SIL-6X-20T",
        variantName: "Silicea - 6X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRS-3X-20-1",
        ],
        packSize: 20,
        potency: "6X",
        costPrice: 120,
        mrp: 150,
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[0]?.id!,
        sku: "DR-SIL-12X-20T",
        variantName: "Silicea - 12X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRS-3X-20-1",
        ],
        packSize: 20,
        potency: "12X",
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[0]?.id!,
        sku: "DR-SIL-30X-20T",
        variantName: "Silicea - 30X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRS-3X-20-1",
        ],
        packSize: 20,
        potency: "30X",
        costPrice: 150,
        mrp: 180, // Add base price before tax and discount
        sellingPrice: 200,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[0]?.id!,
        sku: "DR-SIL-200X-20T",
        variantName: "Silicea - 200X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRS-3X-20-1",
        ],
        packSize: 20,
        potency: "200X",
        costPrice: 200,
        mrp: 230, // Add base price before tax and discount
        sellingPrice: 250,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[1]?.id!,
        sku: "DR-NAT-SUL-3X-20T",
        variantName: "Natrum Sulphuricum - 3X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRNS-3X-20-1",
        ],
        packSize: 20,
        potency: "3X",
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[2]?.id!,
        sku: "DR-MAG-PHOS-6X-20T",
        variantName: "Magnesia Phosphoricum - 6X - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRMP-6X-20-1",
        ],
        packSize: 20,
        potency: "6X",
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[3]?.id!,
        sku: "SBL-SIL-6X-25T",
        variantName: "Silicea 6X - 25gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBLSIL-6X-25-1",
        ],
        packSize: 25,
        potency: "NONE",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[3]?.id!,
        sku: "SBL-SIL-6X-450T",
        variantName: "Silicea 6X - 450gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBLSIL-6X-450-1",
        ],
        packSize: 450,
        potency: "6X",
        costPrice: 500,
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[4]?.id!,
        sku: "SBL-NAT-SUL-6X-25T",
        variantName: "Natrum Sulphuricum 6X - 25gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SNM-200X-25-1",
        ],
        packSize: 25,
        potency: "6X",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[4]?.id!,
        sku: "SBL-NAT-SUL-6X-450T",
        variantName: "Natrum Sulphuricum 6X - 450gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SNM-200X-450-1",
        ],
        packSize: 450,
        potency: "6X",
        costPrice: 500,
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[5]?.id!,
        sku: "SBL-NAT-MUR-200X-25T",
        variantName: "Natrum Muriaticum 200X",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SNM-200X-25-1",
        ],
        packSize: 25,
        potency: "200X",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[5]?.id!,
        sku: "SBL-NAT-MUR-200X-450T",
        variantName: "Natrum Muriaticum 200X",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SNM-200X-450-1",
        ],
        packSize: 450,
        potency: "200X",
        costPrice: 500,
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[6]?.id!,
        sku: "SBL-BC10-25T",
        variantName: "Bio Combination 10",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1ET-10M-25-1",
        ],
        packSize: 25,
        potency: "10M",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[6]?.id!,
        sku: "SBL-BC10-450T",
        variantName: "Bio Combination 10",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1ET-NONE-450-1",
        ],
        packSize: 450,
        costPrice: 500,
        potency: "NONE",
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[7]?.id!,
        sku: "SBL-BC11-25T",
        variantName: "Bio Combination 11",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1P-30C-25-1",
        ],
        packSize: 25,
        potency: "30C",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[7]?.id!,
        sku: "SBL-BC11-450T",
        variantName: "Bio Combination 11",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1P-NONE-450-1",
        ],
        packSize: 450,
        potency: "NONE",
        costPrice: 500,
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[8]?.id!,
        sku: "SBL-BC12-25T",
        variantName: "Bio Combination 12",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1H-NONE-25-1",
        ],
        packSize: 25,
        potency: "NONE",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[8]?.id!,
        sku: "SBL-BC12-450T",
        variantName: "Bio Combination 12",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SBC1H-NONE-450-1",
        ],
        packSize: 450,
        potency: "NONE",
        costPrice: 500,
        mrp: 600, // Add base price before tax and discount
        sellingPrice: 650,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[9]?.id!,
        sku: "DR-BC1-20T",
        variantName: "Bio Combination 1 - (20g)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRBC1A-30X-20-1",
        ],
        packSize: 20,
        potency: "30X",
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[10]?.id!,
        sku: "DR-BC2-20T",
        variantName: "Bio Combination 2 (20g)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRBC2A-12X-20-1",
        ],
        packSize: 20,
        potency: "12X",
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[11]?.id!,
        sku: "DR-BC3-20T",
        variantName: "Bio Combination 3 (20g)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/DRR-DRBC3C-NONE-20-1",
        ],
        packSize: 20,
        costPrice: 120,
        mrp: 150, // Add base price before tax and discount
        sellingPrice: 165,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[12]?.id!,
        sku: "WS-BC20-20T",
        variantName: "Bio Combination 20 - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/WIL-WSIBC2SD-NONE-20-1",
        ],
        packSize: 20,
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 85,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[12]?.id!,
        sku: "WS-BC20-550T",
        variantName: "Bio Combination 20 - 550gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/WIL-WSIBC2SD-NONE-550-1",
        ],
        packSize: 550,
        costPrice: 600,
        mrp: 700, // Add base price before tax and discount
        sellingPrice: 730,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[13]?.id!,
        sku: "WS-BC21-20T",
        variantName: "Bio Combination 21 - 20gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/WIL-WSIBC2TT-NONE-20-1",
        ],
        packSize: 20,
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 85,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[13]?.id!,
        sku: "WS-BC21-550T",
        variantName: "Bio Combination 21 - 550gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/WIL-WSIBC2TT-NONE-550-1",
        ],
        packSize: 550,
        costPrice: 600,
        mrp: 700, // Add base price before tax and discount
        sellingPrice: 730,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[14]?.id!,
        sku: "SBL-ABEL-MOS-1000CH-30ML",
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SAM-1M CH-30-1",
        ],
        packSize: 30,
        potency: "1M CH",
        costPrice: 100,
        mrp: 120, // Add base price before tax and discount
        sellingPrice: 130,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[14]?.id!,
        sku: "SBL-ABEL-MOS-200CH-30ML",
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SAM-200CH-30-1",
        ],
        packSize: 30,
        potency: "200CH",
        costPrice: 70,
        mrp: 90, // Add base price before tax and discount
        sellingPrice: 90,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[14]?.id!,
        sku: "SBL-ABEL-MOS-30CH-30ML",
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SAM-30CH-30-1",
        ],
        packSize: 30,
        potency: "30CH",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 85,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[14]?.id!,
        sku: "SBL-ABEL-MOS-6CH-30ML",
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SAM-6CH-30-1",
        ],
        packSize: 30,
        potency: "6CH",
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 85,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[15]?.id!,
        sku: "SBL-MOS-1X-30ML",
        variantName: "Moschus 1X (Q) - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/SBL-SAM-1X-30-1",
        ],
        packSize: 30,
        potency: "1X",
        costPrice: 90,
        mrp: 110, // Add base price before tax and discount
        sellingPrice: 115,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[16]?.id!,
        sku: "BAK-ACNE-AID-TWIN",
        variantName: "Acne Aid (Twin Pack)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/BAC-BAA(P-NONE-40-1",
        ],
        potency: "NONE",
        costPrice: 200,
        mrp: 250, // Add base price before tax and discount
        sellingPrice: 290,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[17]?.id!,
        sku: "BAK-SUN-HRC-100G",
        variantName: "sunny hair removal cream - 100gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/BAC-BSHRC-NONE-60-1",
        ],
        packSize: 100,
        costPrice: 100,
        mrp: 130, // Add base price before tax and discount
        sellingPrice: 155,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[17]?.id!,
        sku: "BAK-SUN-HRC-60G",
        variantName: "sunny hair removal cream - 60gms",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/BAC-BSHRC-NONE-60-1",
        ],
        packSize: 60,
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 95,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[18]?.id!,
        sku: "HAP-NOK-CRM-25G",
        variantName: "Nokrack Cream - (25g)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/HAP-HNC-NONE-25-1",
        ],
        packSize: 25,
        costPrice: 50,
        mrp: 70, // Add base price before tax and discount
        sellingPrice: 80,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[19]?.id!,
        sku: "ALL-IMM-BOOST-25T",
        variantName: "Immunity Booster Tablet (25)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/ALL-AIBT-NONE-25-1",
        ],
        packSize: 25,
        costPrice: 100,
        mrp: 130, // Add base price before tax and discount
        sellingPrice: 155,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[20]?.id!,
        sku: "ALL-MULTI-VIT-30T",
        variantName: "Multi Vitamins - 30 Tablets",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/ALL-AMV-NONE-30-1",
        ],
        packSize: 30,
        costPrice: 250,
        mrp: 350, // Add base price before tax and discount
        sellingPrice: 385,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[20]?.id!,
        sku: "ALL-MULTI-VIT-60T",
        variantName: "Multi Vitamins - 60 Tablets",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/ALL-AMV-NONE-60-1",
          "https://mhp-local.s3.ap-south-1.amazonaws.com/ALL-AMV-NONE-60-2",
        ],
        packSize: 60,
        costPrice: 500,
        mrp: 700, // Add base price before tax and discount
        sellingPrice: 775,
        discount: 10,
        discountType: "PERCENTAGE",
      },
      {
        productId: products[21]?.id!,
        sku: "ADV-BABY-DROP-30ML",
        variantName: "Babyson Drops - (30ml)",
        variantImage: [
          "https://mhp-local.s3.ap-south-1.amazonaws.com/ADV-ABD-NONE-30-1",
        ],
        packSize: 30,
        costPrice: 60,
        mrp: 80, // Add base price before tax and discount
        sellingPrice: 85,
        discount: 10,
        discountType: "PERCENTAGE",
      },
    ])
    .returning()

  // Create inventory records for each store and product variant
  const inventoryEntries = []

  // Generate inventory entries for all product variants across all stores
  for (const variant of productVariants) {
    for (const store of stores) {
      // Default all entries to 0 stock
      let stock = 0

      // If this is the Mangalore-01 store, set the actual stock values
      // that were previously in the stockByLocation array
      if (store.code === "MANGALORE-01") {
        // Map of SKUs to their previous stock values for MANGALORE-01
        const stockMapping: Record<string, number> = {
          "DR-SIL-3X-20T": 15,
          "DR-SIL-6X-20T": 12,
          "DR-SIL-12X-20T": 9,
          "DR-SIL-30X-20T": 9,
          "DR-SIL-200X-20T": 11,
          "DR-NAT-SUL-3X-20T": 13,
          "DR-MAG-PHOS-6X-20T": 10,
          "SBL-SIL-6X-25T": 15,
          "SBL-SIL-6X-450T": 10,
          "SBL-NAT-SUL-6X-25T": 12,
          "SBL-NAT-SUL-6X-450T": 8,
          "SBL-NAT-MUR-200X-25T": 10,
          "SBL-NAT-MUR-200X-450T": 5,
          "SBL-BC10-25T": 15,
          "SBL-BC10-450T": 10,
          "SBL-BC11-25T": 12,
          "SBL-BC11-450T": 8,
          "SBL-BC12-25T": 10,
          "SBL-BC12-450T": 5,
          "DR-BC1-20T": 15,
          "DR-BC2-20T": 12,
          "DR-BC3-20T": 8,
          "WS-BC20-20T": 10,
          "WS-BC20-550T": 5,
          "WS-BC21-20T": 13,
          "WS-BC21-550T": 8,
          "SBL-ABEL-MOS-1000CH-30ML": 15,
          "SBL-ABEL-MOS-200CH-30ML": 12,
          "SBL-ABEL-MOS-30CH-30ML": 8,
          "SBL-ABEL-MOS-6CH-30ML": 10,
          "SBL-MOS-1X-30ML": 15,
          "BAK-ACNE-AID-TWIN": 12,
          "BAK-SUN-HRC-100G": 10,
          "BAK-SUN-HRC-60G": 13,
          "HAP-NOK-CRM-25G": 14,
          "ALL-IMM-BOOST-25T": 11,
          "ALL-MULTI-VIT-30T": 12,
          "ALL-MULTI-VIT-60T": 10,
          "ADV-BABY-DROP-30ML": 13,
        }

        if (variant.sku in stockMapping) {
          stock = stockMapping[variant.sku] || 0
        }
      }

      inventoryEntries.push({
        productVariantId: variant.id,
        storeId: store.id,
        stock: stock,
        lowStockThreshold: 5,
        reservedStock: 0,
      })
    }
  }

  const productInventory = await db
    .insert(schema.productInventory)
    .values(inventoryEntries)
    .returning()

  const orders = await db
    .insert(schema.order)
    .values([
      {
        userId: users[0]?.id!,
        // createdAt: new Date(),
        orderType: "ONLINE",
        subtotal: 985,
        shippingCost: 50,
        discount: 0,
        tax: 0,
        totalAmountPaid: 1035,
        deliveryStatus: "OUT_FOR_DELIVERY",
        paymentStatus: "PAID",
        addressId: addresses[0]?.id!,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        userId: users[1]?.id!,
        // createdAt: new Date(),
        orderType: "ONLINE",
        subtotal: 85,
        shippingCost: 0,
        discount: 0,
        tax: 0,
        totalAmountPaid: 85,
        deliveryStatus: "DELIVERED",
        paymentStatus: "PAID",
        addressId: addresses[1]?.id!,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        userId: users[2]?.id!,
        // createdAt: new Date(),
        orderType: "ONLINE",
        subtotal: 775,
        shippingCost: 0,
        discount: 0,
        tax: 0,
        totalAmountPaid: 775,
        deliveryStatus: "PROCESSING",
        paymentStatus: "PAID",
        addressId: addresses[2]?.id!,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        userId: users[3]?.id!,
        // createdAt: new Date(),
        orderType: "ONLINE",
        subtotal: 290,
        shippingCost: 0,
        discount: 0,
        tax: 0,
        totalAmountPaid: 290,
        deliveryStatus: "SHIPPED",
        paymentStatus: "PAID",
        addressId: addresses[3]?.id!,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        userId: users[4]?.id!,
        // createdAt: new Date(),
        orderType: "ONLINE",
        subtotal: 155,
        shippingCost: 0,
        discount: 0,
        tax: 0,
        totalAmountPaid: 155,
        deliveryStatus: "DELIVERED",
        paymentStatus: "PAID",
        addressId: addresses[4]?.id!,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    ])
    .returning()

  const orderDetails = await db.insert(schema.orderDetails).values([
    {
      orderId: orders[0]?.id!,
      productVariantId: productVariants[6]?.id!,
      quantity: 1,
      originalPrice: 650,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 650,
      itemStatus: "OUT_FOR_DELIVERY",
      fulfilledFromStoreId: stores[0]?.id!,
    },
    {
      orderId: orders[0]?.id!,
      productVariantId: productVariants[32]?.id!,
      quantity: 1,
      originalPrice: 385,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 385,
      itemStatus: "OUT_FOR_DELIVERY",
      fulfilledFromStoreId: stores[0]?.id!,
    },
    {
      orderId: orders[1]?.id!,
      productVariantId: productVariants[34]?.id!,
      quantity: 1,
      originalPrice: 85,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 85,
      itemStatus: "DELIVERED",
      fulfilledFromStoreId: stores[0]?.id!,
    },
    {
      orderId: orders[2]?.id!,
      productVariantId: productVariants[33]?.id!,
      quantity: 1,
      originalPrice: 775,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 775,
      itemStatus: "PROCESSING",
      fulfilledFromStoreId: stores[0]?.id!,
    },
    {
      orderId: orders[3]?.id!,
      productVariantId: productVariants[31]?.id!,
      quantity: 1,
      originalPrice: 290,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 290,
      itemStatus: "SHIPPED",
      fulfilledFromStoreId: stores[0]?.id!,
    },
    {
      orderId: orders[4]?.id!,
      productVariantId: productVariants[30]?.id!,
      quantity: 1,
      originalPrice: 155,
      discountAmount: 0,
      taxAmount: 0,
      unitPrice: 155,
      itemStatus: "DELIVERED",
      fulfilledFromStoreId: stores[0]?.id!,
    },
  ])

  const tags = await db
    .insert(schema.tag)
    .values(
      [
        "HOMEOPATHY",
        "NUTRITION-SUPPLEMENTS",
        "BIOCHEMIC",
        "BIOCOMBINATION",
        "DILUTION",
        "MOTHERTINCTURE",
        "SBL",
        "DR.RECKEWEG",
        "6X",
        "30X",
        "200C",
        "1M",
      ].map((name) => ({ name }))
    )

  console.log("✅ Seeding completed!")
  process.exit(0)
}

seed().catch((e) => {
  console.error("❌ Seeding failed:")
  console.error(e)
  process.exit(1)
})
