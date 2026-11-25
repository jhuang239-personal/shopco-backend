import { Prisma } from "../generated/prisma/client";
import prisma from "./prisma";
import { getFileUrl } from "./oci-storage";

export const PRODUCT_PAGE_SIZE = 9;

// Sales that are active today: start_date <= today <= end_date.
export const activeSaleFilter = (): Prisma.SaleWhereInput => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return { start_date: { lte: today }, end_date: { gte: today } };
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const pickById = <T extends { id: string }>(ids: string[], byId: Map<string, T>) => {
  const found = ids.map((id) => byId.get(id)).filter((x): x is T => !!x);
  // Matches the old SQL json_agg, which produced NULL when nothing matched.
  return found.length > 0 ? found : null;
};

/**
 * Adds averageRating, categories and styles to products.
 * These were computed with raw SQL subqueries before; Prisma has no computed
 * attributes, so they are resolved with batched queries instead.
 */
export const attachProductExtras = async <
  T extends { id: string; category_ids: string[]; style_ids: string[] },
>(
  products: T[]
) => {
  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const categoryIds = [...new Set(products.flatMap((p) => p.category_ids))];
  const styleIds = [...new Set(products.flatMap((p) => p.style_ids))];

  const [ratings, categories, styles] = await Promise.all([
    prisma.review.groupBy({
      by: ["product_id"],
      where: { product_id: { in: productIds } },
      _avg: { rating: true },
    }),
    prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    }),
    prisma.dressStyle.findMany({
      where: { id: { in: styleIds } },
      select: { id: true, name: true },
    }),
  ]);

  const ratingByProduct = new Map(
    ratings.map((r) => [r.product_id, round2(r._avg.rating ?? 0)])
  );
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const styleById = new Map(styles.map((s) => [s.id, s]));

  return products.map((p) => ({
    ...p,
    averageRating: ratingByProduct.get(p.id) ?? 0,
    categories: pickById(p.category_ids, categoryById),
    styles: pickById(p.style_ids, styleById),
  }));
};

// Resolves category objects for a list of ids (used by the cart).
export const resolveCategories = async (categoryIds: string[]) => {
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  return pickById(categoryIds, new Map(categories.map((c) => [c.id, c])));
};

export const withImageUrls = async <T extends { file_name: string }>(imgs: T[]) =>
  Promise.all(
    imgs.map(async (img) => ({ ...img, url: await getFileUrl(img.file_name) }))
  );

const listSelect = () => ({
  ProductImgs: {
    orderBy: { createdAt: "asc" as const },
    take: 1,
    select: { id: true, file_name: true },
  },
  Brand: { select: { id: true, name: true } },
  Sales: {
    where: activeSaleFilter(),
    take: 1,
    select: { discount: true },
  },
});

/** Paginated product list used by every listing endpoint. */
export const listProducts = async ({
  where = {},
  orderBy = { createdAt: "asc" },
  page,
  limit = PRODUCT_PAGE_SIZE,
}: {
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
  page: number;
  limit?: number;
}) => {
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: listSelect(),
    }),
  ]);

  const enriched = await attachProductExtras(rows);
  const items = await Promise.all(
    enriched.map(async (p) => ({
      ...p,
      ProductImgs: await withImageUrls(p.ProductImgs),
    }))
  );

  return {
    items,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
};

export const findProductDetail = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      Reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          rating: true,
          comment: true,
          user_id: true,
          createdAt: true,
        },
      },
      ProductImgs: {
        orderBy: { createdAt: "asc" },
        select: { id: true, file_name: true },
      },
      Brand: { select: { id: true, name: true } },
      Sales: {
        where: activeSaleFilter(),
        take: 1,
        select: { discount: true },
      },
    },
  });
  if (!product) return null;

  const [enriched] = await attachProductExtras([product]);
  return {
    ...enriched,
    ProductImgs: await withImageUrls(product.ProductImgs),
  };
};
