import "dotenv/config";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  brands,
  styles,
  categories,
  slugify,
  reviewPools,
} from "./seed/catalog";

const connectionString = process.env.prismadb_connector;
if (!connectionString) {
  throw new Error("prismadb_connector must be set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const IMAGES_PER_PRODUCT = 3;
const REVIEWERS = 6;
const DAY = 24 * 60 * 60 * 1000;

// 2 positive, 2 neutral and 2 negative reviews per product.
const reviewPlan = [
  { pool: "positive" as const, ratings: [5, 4] },
  { pool: "neutral" as const, ratings: [3, 3] },
  { pool: "negative" as const, ratings: [2, 1] },
];

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log(
      `Seed skipped: ${existing} categories already exist. Clear the tables first to reseed.`
    );
    return;
  }

  const counts = await prisma.$transaction(
    async (tx) => {
      const brandIds = new Map<string, string>();
      for (const name of brands) {
        const brand = await tx.brand.create({ data: { name } });
        brandIds.set(name, brand.id);
      }

      const styleIds = new Map<string, string>();
      for (const name of styles) {
        const style = await tx.dressStyle.create({ data: { name } });
        styleIds.set(name, style.id);
      }

      // Reviewer accounts so that review.user_id points at real usernames.
      const reviewerNames = Array.from(
        { length: REVIEWERS },
        (_, i) => `reviewer${String(i + 1).padStart(2, "0")}`
      );
      const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
      await tx.user.createMany({
        data: reviewerNames.map((username) => ({
          username,
          email: `${username}@seed.example.com`,
          password: passwordHash,
          type: "user",
        })),
        skipDuplicates: true,
      });

      let productCount = 0;
      let imageCount = 0;
      let reviewCount = 0;
      let globalIndex = 0;

      for (const category of categories) {
        const categorySlug = slugify(category.name);
        const category_row = await tx.category.create({
          data: { name: category.name },
        });

        for (const product of category.products) {
          const productRow = await tx.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              brand_id: brandIds.get(product.brand)!,
              category_ids: [category_row.id],
              style_ids: product.styles.map((s) => styleIds.get(s)!),
            },
          });
          productCount++;

          const productSlug = slugify(product.name);
          await tx.productImg.createMany({
            data: Array.from({ length: IMAGES_PER_PRODUCT }, (_, i) => ({
              product_id: productRow.id,
              file_name: `seed/${categorySlug}/${productSlug}-${i + 1}.jpg`,
            })),
          });
          imageCount += IMAGES_PER_PRODUCT;

          const reviews = reviewPlan.flatMap((plan, planIndex) =>
            plan.ratings.map((rating, k) => {
              const slot = planIndex * 2 + k;
              const pool = reviewPools[plan.pool];
              return {
                comment: pool[(globalIndex + slot) % pool.length],
                rating,
                user_id: reviewerNames[(globalIndex + slot) % REVIEWERS],
                product_id: productRow.id,
                createdAt: new Date(Date.now() - (globalIndex * 3 + slot * 7) * DAY),
              };
            })
          );
          await tx.review.createMany({ data: reviews });
          reviewCount += reviews.length;

          globalIndex++;
        }
      }

      return {
        brands: brandIds.size,
        styles: styleIds.size,
        categories: categories.length,
        products: productCount,
        images: imageCount,
        reviews: reviewCount,
      };
    },
    { timeout: 120_000, maxWait: 10_000 }
  );

  console.log("Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
