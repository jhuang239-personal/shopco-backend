import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { withImageUrls, resolveCategories } from "../utils/product-query";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

// Shared include for cart rows: product name, price, categories and newest image.
const cartInclude = {
  Product: {
    select: {
      name: true,
      price: true,
      category_ids: true,
      ProductImgs: {
        orderBy: { createdAt: "desc" as const },
        take: 1,
        select: { id: true, file_name: true },
      },
    },
  },
};

// Builds the cart response shape that the API has always returned.
const formatCart = async (rows: Awaited<ReturnType<typeof findCartRows>>) => {
  return Promise.all(
    rows.map(async (item) => {
      const { category_ids, ProductImgs, ...productRest } = item.Product;
      const categories = await resolveCategories(category_ids);
      return {
        ...item,
        Product: {
          ...productRest,
          categories,
          ProductImgs: await withImageUrls(ProductImgs),
        },
      };
    })
  );
};

const findCartRows = (user_id: string) =>
  prisma.cart.findMany({
    where: { user_id },
    include: cartInclude,
    orderBy: { createdAt: "desc" },
  });

const getCartQuantity = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const cartItems = await prisma.cart.findMany({
      where: { user_id },
      select: { product_id: true },
    });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const addProductToCart = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const { product_id, quantity, color, size } = req.body;
    const cart = await prisma.cart.create({
      data: {
        user_id,
        product_id,
        quantity: parseInt(quantity, 10),
        color,
        size,
      },
    });
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

// Returns the formatted cart, or null when it is empty (used by update endpoints).
const getCartFunction = async (user_id: string) => {
  const rows = await findCartRows(user_id);
  if (rows.length === 0) return null;
  return formatCart(rows);
};

const getCart = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const rows = await findCartRows(user_id);
    if (rows.length === 0) {
      res.status(200).json({ message: "Cart is empty" });
      return;
    }
    res.status(200).json(await formatCart(rows));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const increaseProductQuantity = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const { id } = req.body;
    const cart = await prisma.cart.findFirst({ where: { user_id, id } });
    if (!cart) {
      res.status(404).json({ error: "Product not found in cart" });
      return;
    }
    await prisma.cart.updateMany({
      where: { user_id, id },
      data: { quantity: cart.quantity + 1 },
    });
    res.status(200).json(await getCartFunction(user_id));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const reduceProductQuantity = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const { id } = req.body;
    const cart = await prisma.cart.findFirst({ where: { user_id, id } });
    if (!cart) {
      res.status(404).json({ error: "Product not found in cart" });
      return;
    }
    if (cart.quantity === 1) {
      await prisma.cart.deleteMany({ where: { user_id, id } });
      res.status(200).json({ message: "Product removed from cart" });
      return;
    }
    await prisma.cart.updateMany({
      where: { user_id, id },
      data: { quantity: cart.quantity - 1 },
    });
    res.status(200).json(await getCartFunction(user_id));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const updateProductQuantity = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const { product_id, quantity } = req.body;
    const cart = await prisma.cart.findFirst({
      where: { user_id, product_id },
    });
    if (!cart) {
      res.status(404).json({ error: "Product not found in cart" });
      return;
    }
    await prisma.cart.updateMany({
      where: { user_id, product_id },
      data: { quantity: parseInt(quantity, 10) },
    });
    res.status(200).json(await getCartFunction(user_id));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const removeProductFromCart = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    const { id } = req.body;
    await prisma.cart.deleteMany({ where: { user_id, id } });
    res.status(200).json(await getCartFunction(user_id));
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const user_id: string = req.body.user.username;
    await prisma.cart.deleteMany({ where: { user_id } });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export {
  getCartQuantity,
  addProductToCart,
  getCart,
  increaseProductQuantity,
  reduceProductQuantity,
  updateProductQuantity,
  removeProductFromCart,
  clearCart,
};
