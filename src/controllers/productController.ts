import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma";
import { findProductDetail, listProducts } from "../utils/product-query";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const pageFrom = (req: Request) => parseInt(req.query.page as string) || 1;

// Multipart form fields arrive as strings, and Prisma does not coerce them.
const toIdList = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") return value.split(",").map((s) => s.trim());
  return undefined;
};

// Replaces the old Sequelize @Validate checks on category / style / brand ids.
const assertCategoriesAndStyles = async (
  categoryIds: string[] | undefined,
  styleIds: string[] | undefined,
  brandId: string | undefined
) => {
  if (brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new Error("Brand does not exist");
  }
  for (const categoryId of categoryIds ?? []) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error(`Category with ID ${categoryId} does not exist`);
    }
  }
  for (const styleId of styleIds ?? []) {
    const style = await prisma.dressStyle.findUnique({
      where: { id: styleId },
    });
    if (!style) throw new Error(`Style with ID ${styleId} does not exist`);
  }
};

const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_ids,
      brand_id,
      style_ids,
    } = req.body;
    const ctg_ids = toIdList(category_ids) ?? [];
    const sty_ids = toIdList(style_ids) ?? [];
    await assertCategoriesAndStyles(ctg_ids, sty_ids, brand_id);

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: parseInt(stock, 10),
        category_ids: ctg_ids,
        brand_id,
        style_ids: sty_ids,
      },
    });
    req.body.result_product_id = product.id;
    next();
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, description, price, stock, category_ids, brand_id } = req.body;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const ctg_ids = toIdList(category_ids);
    await assertCategoriesAndStyles(ctg_ids, undefined, brand_id);

    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price === undefined ? undefined : Number(price),
        stock: stock === undefined ? undefined : parseInt(stock, 10),
        category_ids: ctg_ids,
        brand_id,
      },
    });
    next();
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getProducts = async (req: Request, res: Response) => {
  try {
    res.status(200).json(
      await listProducts({ page: pageFrom(req) })
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getLatestProducts = async (req: Request, res: Response) => {
  try {
    res.status(200).json(
      await listProducts({
        page: pageFrom(req),
        limit: 4,
        orderBy: { createdAt: "desc" },
      })
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await findProductDetail(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryName = req.query.categoryName as string;
    if (!categoryName) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }
    const category = await prisma.category.findFirst({
      where: { name: { equals: categoryName, mode: "insensitive" } },
      select: { id: true },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    const result = await listProducts({
      page: pageFrom(req),
      where: { category_ids: { has: category.id } },
    });
    res.status(200).json({ ...result, categoryName });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getProductsByBrand = async (req: Request, res: Response) => {
  try {
    const brandName = req.query.brandName as string;
    if (!brandName) {
      res.status(400).json({ error: "Brand name is required" });
      return;
    }
    const brand = await prisma.brand.findFirst({
      where: { name: { equals: brandName, mode: "insensitive" } },
      select: { id: true },
    });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    const result = await listProducts({
      page: pageFrom(req),
      where: { brand_id: brand.id },
    });
    res.status(200).json({ ...result, brandName });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    // Images are removed first so the counts reflect what was deleted.
    const imgs = await prisma.productImg.deleteMany({
      where: { product_id: id },
    });
    const deleted = await prisma.product.deleteMany({ where: { id } });

    res.status(200).json({ result: deleted.count, result_img: imgs.count });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getProductsWithFilters = async (req: Request, res: Response) => {
  try {
    const { style_ids, brand_id, category_ids, product_name } = req.body;

    const where: Prisma.ProductWhereInput = {};
    if (style_ids && style_ids.length > 0) {
      where.style_ids = { hasEvery: style_ids };
    }
    if (brand_id) {
      where.brand_id = brand_id;
    }
    if (category_ids && category_ids.length > 0) {
      where.category_ids = { hasEvery: category_ids };
    }
    if (product_name) {
      where.name = { contains: product_name, mode: "insensitive" };
    }

    res.status(200).json(
      await listProducts({ page: pageFrom(req), where })
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: errorMessage(error) });
  }
};

export {
  addProduct,
  updateProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getProductsWithFilters,
  getProductsByBrand,
  getLatestProducts,
  getProductsByCategory,
};
