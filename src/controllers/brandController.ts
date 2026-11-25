import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const addBrand = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    const brand = await prisma.brand.create({ data: { name } });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    await prisma.brand.delete({ where: { id } });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export { addBrand, getBrands, deleteBrand };
