import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Internal Server Error";

const createSale = async (req: Request, res: Response) => {
  const { start_date, end_date, discount, product_id } = req.body;
  try {
    const sale = await prisma.sale.create({
      data: {
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        discount: Number(discount),
        product_id,
      },
    });
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const getSaleByProductId = async (req: Request, res: Response) => {
  const { product_id } = req.params;
  try {
    const sales = await prisma.sale.findMany({ where: { product_id } });
    if (sales.length === 0) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }
    res.status(200).json(sales);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

export { createSale, getSaleByProductId };
