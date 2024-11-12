import { db } from "./db"
import * as schema from "./schema"
import { hash } from "bcryptjs"

async function seed() {
  console.log("🌱 Seeding started...")

  await db.delete(schema.review)
  await db.delete(schema.orderDetails)
  await db.delete(schema.order)
  await db.delete(schema.product)
  await db.delete(schema.category)
  await db.delete(schema.manufacturer)
  await db.delete(schema.twoFactorConfirmation)
  await db.delete(schema.account)
  await db.delete(schema.user)
  await db.delete(schema.address)
  await db.delete(schema.productVariant)
  await db.delete(schema.paymentMethod)

  const hashedPassword = await hash("password123", 10)

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
        phone: "_1234567890",
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
    ])
    .returning()

  console.log(users)
  if (users.length === 0) {
    console.error("Error: No users created. Aborting the seeding process.")
    return
  }

  const addresses = await db
    .insert(schema.address)
    .values([
      {
        userId: users[0].id,
        street: "J street",
        city: "Bangaluru",
        state: "Karnataka",
        country: "India",
        postalCode: "560067",
      },
      {
        userId: users[1].id,
        street: "K street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400076",
      },
    ])
    .returning()

  const mainCategories = await db
    .insert(schema.category)
    .values([
      { name: "Homeopathy" },
      { name: "Nutrition-Supplements" },
      { name: "Babycare" },
    ])
    .returning()

  const subCategories = await db
    .insert(schema.category)
    .values([
      { name: "Biochemics", parentId: mainCategories[0]?.id },
      { name: "Biocombinations", parentId: mainCategories[0]?.id },
      { name: "Dilutions", parentId: mainCategories[0]?.id },
      { name: "Mothertinctures", parentId: mainCategories[0]?.id },
      { name: "Cosmetics", parentId: mainCategories[0]?.id },
    ])
    .returning()

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

  const products = await db
    .insert(schema.product)
    .values([
      {
        name: "Dr. Reckeweg Silicea",
        description:
          "Reckeweg Silicea tablet is well known as a tissue salt to ripen infections and remove them through the surface. It acts as a blood cleanser and is useful in abscesses, tonsillitis, styes and other infections to promote the formation of pus when an outlet is available. When it is lacking, the nails, hair and bones may become weak. Weakness and poor stamina may be evident in other parts of the body.",

        tags: ["medicine", "homeopathy", "Biochemic", "Dr. Reckeweg"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[1].id,
        properties: {
          keyIngredients: "Silicea(Silica)",
          KeyBenefits: [
            "Silicea supports the body's natural healing processes, aiding in the management of skin conditions, abscesses, and suppurations",
            "It promotes the expulsion of foreign bodies, assisting in the healing of wounds and accelerating recovery",
            "Helps strengthen hair, nails, and connective tissues, contributing to improved overall health",
          ],
          directionForUse: [
            "Take the recommended dosage as mentioned on the label or as advised by a healthcare professional",
            "Tablets are typically dissolved under the tongue or in a small amount of water and taken multiple times a day",
          ],
          sefetyInformation: [
            "Store in a cool, dry place.",
            "Keep out of reach of children.",
            "Keep away from the direct sunlight.",
          ],
        },
      },
      {
        name: "Dr. Reckeweg Natrum Sulphuricum",
        description:
          "Natrum sulphuricum regulates the distribution of water and the flow of bile. It removes the excess of water from the blood. It keeps the bile in normal consistency. Natrum sulph is the water removing tissue salt. It helpful for water retention that takes place in the body. An imbalance of sodium sulphate produces edema in the tissues, dry skin with watery eruptions.",

        tags: ["medicine", "homeopathy", "Dr. Reckeweg"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[1].id,
        properties: {
          uses: "Breathlessness brought on by humidity.The effects of head injuries may be remedied by Natrum sulph. helps in detoxification (removes toxic products).",
        },
      },
      {
        name: "Dr. Reckeweg Magnesia Phosphoricum",
        description:
          "Phosphate of Magnesia is contained in blood-corpuscles, muscles, brain, spinal marrow, nerves, teeth. Disturbance of its molecules results in pains, cramps, paralysis. Magnesia Phosphorica makes up white matter of muscles and nerve. Mag phos is a mineral supplement to restore energy and begin the regeneration of the bodyâ€™s nerves and muscles. A nutrition and functional remedy for nerve tissues.",

        tags: ["medicine", "homeopathy", "Dr. Reckeweg"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[1].id,
        properties: {
          uses: "Its an anti spasmodic remedy useful for pains all over the body, back, leg, calf muscles etc.Migraines, fatigue, hearing disorders, Meniere's disease (disease of middle ear with dizziness and ringing in ears) neuralgia, Mag Phos gives good results.Panic attacks, Headaches of school children.",
        },
      },
      {
        name: "SBL Silicea",
        description:
          "Silicea is well known as a tissue salt to ripen infections and removes them through the surface. It acts as a blood cleanser and is useful in abscesses, tonsillitis, styes and other infections to promote the formation of pus when an outlet is available. When it is lacking, the nails, hair and bones may become weak. Weakness and poor stamina may be evident in other parts of the body.",

        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[0].id,
        properties: {
          uses: "Silicea is vital to the development of bones, the flexibility of cartilage, and the health of skin and connective tissues.Successful in relieving boils, pimples and abscesses, blood cleansing and rebuilding the body after illness or injury.Headaches beginning in the back of the head and spreading forward to the eyes are recovered by Silicea.",
        },
      },
      {
        name: "SBL Natrum Sulphuricum",
        description:
          "Natrum sulph regulates the distribution of water and the flow of bile. It removes the excess of water from the blood. It keeps the bile in normal consistency. Natrum sulph is the water removing tissue salt.",

        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[0].id,
        properties: {
          uses: "Breathlessness brought on by humidity.The effects of head injuries may be remedied by Natrum sulph.It helps in detoxification (removes toxic products).",
        },
      },
      {
        name: "SBL Natrum Muriaticum",
        description:
          "It is a mineral with an affinity for fluids, and as it is in nature so it is in the body. It is found predominantly in the extracellular fluids, in striking contrast with the potassium salts.",

        tags: ["medicine", "homeopathy", "SBL"],
        categoryId: subCategories[0].id,
        manufacturerId: manufacturers[0].id,
        properties: {
          uses: "For headache, toothache, stomachache (PAINS).Hypersecretion of tears or vomitting of water and mucus.Anemia (low Hb), leucocytosis (increased WBC count) gouty and rheumatic gout, Dry Mucous membranes.",
        },
      },
      {
        name: "SBL Bio Combination 10 Enlarged Tonsils",
        description:
          "BC 10- Enlarged Tonsils Composition of SBL Bio Combination 10 Calcarea phosphorica â€“ 3x Kalium muriaticum â€“ 3x Ferrum phosphoricum â€“ 3x Indications of SBL Bio Combination 10",

        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[0].id,
      },
      {
        name: "SBL Bio Combination 11 Pyrexia",
        description:
          "BC 11- Pyrexia Composition of  SBL Bio Combination 11 Ferrum phosphoricum 3X Kali muriaticum Kali sulphuricum 3X Natrum muriaticum 3X",

        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[0].id,
      },
      {
        name: "SBL Bio Combination 12 Headache",
        description:
          "BC 12- Headache Composition of  SBL Bio Combination 12 Ferrum phosphoricum 3x, Kalium phosphoricum 3x, Magnesia phosphorica 3x,Natrum muriaticum 3x.",

        tags: ["medicine", "homeopathy", "Bio combination", "SBL"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[0].id,
      },
      {
        name: "Dr. Reckeweg Bio Combination 1 Anaemla",
        description:
          "BC 1- Anaemia Composition of Dr. Reckeweg Bio Combination 1 Calcarea Phosphorica 3x Ferrum Phosphoricum 3x Natrum Muriaticum 6x Kalium Phosphoricum 3x Indications of Dr. Reckeweg Bio Combination 1 Lack of blood or loss of blood from any part of the body General Wasting of tissues Waxy appearance of  Mental Depression, Worry, Physical Exhaustion, Weakness Poor digestion in children.",

        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[1].id,
      },
      {
        name: "Dr. Reckeweg Bio Combination 2 Asthama",
        description:
          "BC 2- For breathing problems Composition of Dr. Reckeweg Bio Combination 2 Magnesia -3x Natrum sulphuricum -3x Natrum muriaticum -3x Kalium phosphoricum -3x",

        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[1].id,
      },
      {
        name: "Dr. Reckeweg Bio Combination 3 Colic",
        description:
          "BC 3- Colic Composition of Dr. Reckeweg Bio Combination 3 Magnesia phosphoricum 3x Natrum sulphuricum 3x Calcarea phosphorica 3x Ferrum phosphoricum 3x",

        tags: ["medicine", "homeopathy", "Bio combination", "Dr. Reckeweg"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[1].id,
      },
      {
        name: "Willmar Schwabe India Bio Combination 20 Skin Diseases",
        description:
          "BC 20- Skin Diseases. Composition of Willmar Schwabe Bio Combination 20 Calcarea fluorica - 6x Calcarea sulphurica - 6x Natrum muriaticum - 6x Kalium sulphuricum - 3x",

        tags: ["medicine", "homeopathy", "Bio combination", "Willmar Schwabe"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[2].id,
      },
      {
        name: "Willmar Schwabe India Bio Combination 21 Teething Trouble",
        description:
          "BC 21- Teething Troubles Composition of Willmar Schwabe Bio Combination 21 Ferrum phosphoricum â€“ 3x Calcarea phosphorica â€“ 3x Indications of Willmar Schwabe Bio Combination 21 Tardy dentition.",

        tags: ["medicine", "homeopathy", "Bio combination", "Willmar Schwabe"],
        categoryId: subCategories[1].id,
        manufacturerId: manufacturers[2].id,
      },
      {
        name: "SBL Abel Moschus",
        description:
          "SBL Abel Moschus (Dilution) Also known as: Abel, Abel mosc, Abe mosch | Common Name: Musk mallow | Other Name: Hibiscus Abelmoschus | Potency: 30 CH | Weight: 82 gms | Dimensions: 3.5 cm x 3.5 cm x 9.5 cm.",

        tags: ["medicine", "homeopathy", "Dilutions", "SBL"],
        categoryId: subCategories[2].id,
        manufacturerId: manufacturers[0].id,
      },
      {
        name: "SBL Abel Moschus",
        description:
          "SBL Abel Moschus (Mother Tincture) Common Name: Musk mallow | Other Name: Hibiscus Abelmoschus Causes & Symptoms: Sleepiness, dysphagia, oedema of hands and legs.",

        tags: ["medicine", "homeopathy", "Mother Tinctures", "SBL"],
        categoryId: subCategories[3].id,
        manufacturerId: manufacturers[0].id,
      },
      {
        name: "Bakson Acne Aid (Twin Pack)",
        description:
          "Hypoallergic & Anti-comedogenic action.Controls excessive sebum accumulation.Provides flawless skin.",

        tags: ["PersonalCare", "Face", "homeopathy", "Cosmetics", "Backson"],
        categoryId: subCategories[3].id,
        manufacturerId: manufacturers[3].id,
      },
      {
        name: "Bakson sunny hair removal cream",
        description:
          "For pain free, gentle removal of unwanted hair and beautiful skin.",

        tags: ["PersonalCare", "Hair", "homeopathy", "Cosmetics", "Bakson"],
        categoryId: subCategories[3].id,
        manufacturerId: manufacturers[3].id,
      },
      {
        name: "Hapdco Nokrack Cream",
        description: "For cracked heels, chaped hands and dry skin.",

        tags: ["PersonalCare", "Foot", "homeopathy", "Cosmetics", "Hapdco"],
        categoryId: subCategories[3].id,
        manufacturerId: manufacturers[4].id,
      },
      {
        name: "Allen Immunity Booster Tablet",
        description:
          "Allen Immunity Booster Tablet is a homeopathic tablet that helps boost the bodyâ€™s defense mechanism and helps combat various bacteria or viruses that cause diseases. It helps in maintaining general wellness. It helps to build stamina. It can also be used to manage common cold, cough or flu. It has no side effects . Pregnant women should consult a physician before taking this medicine.",

        tags: [
          "Nutrition-Suplements",
          "homeopathy",
          "Immunity Booster",
          "Allen",
        ],
        categoryId: mainCategories[1].id,
        manufacturerId: manufacturers[5].id,
      },
      {
        name: "Allen Multi Vitamins",
        description:
          "There are a lot of good reasons to take multivitamin supplements. Even the best eating plans can fall short of meeting all of the 40 plus nutrients you need each day. Many fail to meet dietary recommendations for many reasons, including strict dieting, poor appetite, changing nutritional needs or less than healthy food choices.",

        tags: ["Nutrition-Suplements", "homeopathy", "Multi-Vitamins", "Allen"],
        categoryId: mainCategories[1].id,
        manufacturerId: manufacturers[5].id,
      },
      {
        name: "Adven Babyson Drops",
        description:
          "Adven Babyson Drops is a well-balanced tonic for children. This product helps to improve the appetite and helps in the overall growth. It promotes better assimilation of calcium, iron, phosphorus, and potassium.",

        tags: ["Baby Care", "homeopathy", "Babyson Drops", "Adven"],
        categoryId: mainCategories[2].id,
        manufacturerId: manufacturers[6].id,
      },
    ])
    .returning()

  const productVariants = await db
    .insert(schema.productVariant)
    .values([
      {
        productId: products[0].id,
        variantName: "Silicea - 3X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Silicea-3X-20g-1.jpg",
        ],
        packSize: "20g",
        potency: "3X",
        price: 165,
        stock: 15,
      },
      {
        productId: products[0].id,
        variantName: "Silicea - 6X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Silicea-6X-20g-1.jpg",
        ],
        packSize: "20g",
        potency: "6X",
        price: 165,
        stock: 12,
      },
      {
        productId: products[0].id,
        variantName: "Silicea - 12X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Silicea-12X-20g-1.jpg",
        ],
        packSize: "20g",
        potency: "12X",
        price: 165,
        stock: 9,
      },
      {
        productId: products[0].id,
        variantName: "Silicea - 30X - 20gms",
        variantImage: [
          "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/e8123be319b64d649d996dc8bc4478cf.jpg",
        ],
        packSize: "20g",
        potency: "30X",
        price: 200,
        stock: 9,
      },
      {
        productId: products[0].id,
        variantName: "Silicea - 200X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Silicea-200X-20g-1.jpg",
        ],
        packSize: "20g",
        potency: "200x",
        price: 250,
        stock: 11,
      },
      {
        productId: products[1].id,
        variantName: "Natrum Sulphuricum - 3X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Natrum-Sulphuricum-3X-20g-2.jpg",
        ],
        packSize: "20gms",
        potency: "3X",
        price: 165,
        stock: 13,
      },
      {
        productId: products[2].id,
        variantName: "Magnesia Phosphoricum - 6X - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Magnesia-Phosphoricum-6X-20g-1.jpg",
        ],
        packSize: "20gms",
        potency: "6X",
        price: 165,
        stock: 10,
      },
      {
        productId: products[3].id,
        variantName: "Silicea 6X - 25gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2023-01-10T171125.911-600x600.jpg",
        ],
        packSize: "25gms",
        potency: "6X",
        price: 90,
        stock: 15,
      },
      {
        productId: products[3].id,
        variantName: "Silicea 6X - 450gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2023-01-10T171009.897.jpg",
        ],
        packSize: "450gms",
        potency: "6X",
        price: 650,
        stock: 10,
      },
      {
        productId: products[4].id,
        variantName: "Natrum Sulphuricum 6X - 25gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2023-01-23T125320.248-600x600.jpg",
        ],
        packSize: "25gms",
        potency: "6X",
        price: 90,
        stock: 12,
      },
      {
        productId: products[4].id,
        variantName: "Natrum Sulphuricum 6X - 450gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2023-01-23T125237.527.jpg",
        ],
        packSize: "450gms",
        potency: "6X",
        price: 650,
        stock: 8,
      },
      {
        productId: products[5].id,
        variantName: "Natrum Muriaticum 200X",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-11-28T175811.277-600x600.jpg",
        ],
        packSize: "25gms",
        potency: "200X",
        price: 90,
        stock: 10,
      },
      {
        productId: products[5].id,
        variantName: "Natrum Muriaticum 200X",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-11-28T175915.259.jpg",
        ],
        packSize: "450gms",
        potency: "200X",
        price: 650,
        stock: 5,
      },
      {
        productId: products[6].id,
        variantName: "Bio Combination 10",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-10-25g.jpg",
        ],
        packSize: "25gms",
        price: 90,
        stock: 15,
      },
      {
        productId: products[6].id,
        variantName: "Bio Combination 10",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-10-450g.jpg",
        ],
        packSize: "450gms",
        price: 650,
        stock: 10,
      },
      {
        productId: products[7].id,
        variantName: "Bio Combination 11",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-11-25g.jpg",
        ],
        packSize: "25gms",
        price: 90,
        stock: 12,
      },
      {
        productId: products[7].id,
        variantName: "Bio Combination 11",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-11-450g.jpg",
        ],
        packSize: "450gms",
        price: 650,
        stock: 8,
      },
      {
        productId: products[8].id,
        variantName: "Bio Combination 12",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-12-25g.jpg",
        ],
        packSize: "25gms",
        price: 90,
        stock: 10,
      },
      {
        productId: products[8].id,
        variantName: "Bio Combination 12",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-12-450g.jpg",
        ],
        packSize: "450gms",
        price: 650,
        stock: 5,
      },
      {
        productId: products[9].id,
        variantName: "Bio Combination 1 - (20g)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-1-20g-1.jpg",
        ],
        price: 165,
        stock: 15,
      },
      {
        productId: products[10].id,
        variantName: "Bio Combination 2 (20g)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-2-20g-1.jpg",
        ],
        price: 165,
        stock: 12,
      },
      {
        productId: products[11].id,
        variantName: "Bio Combination 3 (20g)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Bio-Combination-3-20g-1.jpg",
        ],
        price: 165,
        stock: 8,
      },
      {
        productId: products[12].id,
        variantName: "Bio Combination 20 - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-09-17T130234.631-600x600.jpg",
        ],
        packSize: "20gms",
        price: 85,
        stock: 10,
      },
      {
        productId: products[12].id,
        variantName: "Bio Combination 20 - 550gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-09-17T130335.154.jpg",
        ],
        packSize: "550gms",
        price: 730,
        stock: 5,
      },
      {
        productId: products[13].id,
        variantName: "Bio Combination 21 - 20gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-09-17T125304.548-150x171.jpg",
        ],
        packSize: "20gms",
        price: 85,
        stock: 13,
      },
      {
        productId: products[13].id,
        variantName: "Bio Combination 21 - 550gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/Untitled-design-2022-09-17T125340.481.jpg",
        ],
        packSize: "550gms",
        price: 730,
        stock: 8,
      },
      {
        productId: products[14].id,
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/SBL-Abel-Moschus-1M-1000-CH-30ml.png",
        ],
        packSize: "30gms",
        potency: "1000CH",
        price: 130,
        stock: 15,
      },
      {
        productId: products[14].id,
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/SBL-Abel-Moschus-200-CH-30ml.png",
        ],
        packSize: "30gms",
        potency: "200CH",
        price: 90,
        stock: 12,
      },
      {
        productId: products[14].id,
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/SBL-Abel-Moschus-30-CH-30ml.png",
        ],
        packSize: "30gms",
        potency: "30CH",
        price: 85,
        stock: 8,
      },
      {
        productId: products[14].id,
        variantName: "Abel Moschus - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/SBL-Abel-Moschus-6-CH-30ml.png",
        ],
        packSize: "30gms",
        potency: "6CH",
        price: 85,
        stock: 10,
      },
      {
        productId: products[15].id,
        variantName: "Moschus 1X (Q) - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/ABEL-MOSCHUS-30-ML-150x150.png",
        ],
        packSize: "30gms",
        price: 115,
        stock: 15,
      },
      {
        productId: products[16].id,
        variantName: "Acne Aid (Twin Pack)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2023/03/Untitled-design-2023-03-11T193215.898-600x600.jpg",
        ],
        price: 290,
        stock: 12,
      },
      {
        productId: products[17].id,
        variantName: "sunny hair removal cream - 100gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/bakson-hair-removel-100.jpg",
        ],
        packSize: "100gms",
        price: 155,
        stock: 10,
      },
      {
        productId: products[17].id,
        variantName: "sunny hair removal cream - 60gms",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/bakson-hair-removel-60-1.jpg",
        ],
        packSize: "60gms",
        price: 95,
        stock: 13,
      },
      {
        productId: products[18].id,
        variantName: "Nokrack Cream - (25g)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/04/hapdco-nocrack-cream-150x171.jpg",
        ],
        packSize: "25gms",
        price: 80,
        stock: 14,
      },
      {
        productId: products[19].id,
        variantName: "Immunity Booster Tablet (25)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/08/Allen-Immunity-Booster-Tablet-25gms-600x600.jpg",
        ],
        packSize: "25Tab",
        price: 155,
        stock: 11,
      },
      {
        productId: products[20].id,
        variantName: "Multi Vitamins - 30 Tablets",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/09/Allen-Multi-Vitamins-30tab.jpg",
        ],
        packSize: "30Tab",
        price: 385,
        stock: 12,
      },
      {
        productId: products[20].id,
        variantName: "Multi Vitamins - 60 Tablets",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/09/Allen-Multi-Vitamins-60tab-1.jpg",
        ],
        packSize: "60Tab",
        price: 775,
        stock: 10,
      },
      {
        productId: products[21].id,
        variantName: "Babyson Drops - (30ml)",
        variantImage: [
          "https://healthyghar.com/wp-content/uploads/2022/05/BABYSON-DROP-600x600.jpg",
        ],
        packSize: "30ml",
        price: 85,
        stock: 13,
      },
    ])
    .returning()

  const orders = await db
    .insert(schema.order)
    .values([
      {
        userId: users[0].id,
        orderDate: new Date(),
        orderType: "ONLINE",
        totalAmountPaid: 1035,
        deliveryStatus: "OUT_FOR_DELIVERY",
        shippingAddressId: addresses[0].id,
        billingAddressId: addresses[0].id,
      },
      {
        userId: users[1].id,
        orderDate: new Date(),
        orderType: "ONLINE",
        totalAmountPaid: 85,
        deliveryStatus: "DELIVERED",
        shippingAddressId: addresses[1].id,
        billingAddressId: addresses[1].id,
      },
    ])
    .returning()

  const orderDetails = await db.insert(schema.orderDetails).values([
    {
      orderId: orders[0].id,
      productVariantId: productVariants[6].id,
      quantity: 1,
      unitPrice: 650,
    },
    {
      orderId: orders[0].id,
      productVariantId: productVariants[32].id,
      quantity: 1,
      unitPrice: 385,
    },
    {
      orderId: orders[1].id,
      productVariantId: productVariants[34].id,
      quantity: 1,
      unitPrice: 85,
    },
  ])

  console.log("✅ Seeding completed!")
  process.exit(0)
}

seed().catch((e) => {
  console.error("❌ Seeding failed:")
  console.error(e)
  process.exit(1)
})
