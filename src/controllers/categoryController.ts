import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export { addCategory, getCategories, deleteCategory };
