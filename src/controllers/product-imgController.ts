import { Request, Response } from "express";
import prisma from "../utils/prisma";

const createProductImg = async (req: Request, res: Response) => {
  try {
    const product_id: string = req.body.result_product_id || req.params.id;
    const file_names: string[] = req.body.uploadedFiles ?? [];
    const createdRecords: string[] = [];
    for (const file_name of file_names) {
      const productImg = await prisma.productImg.create({
        data: { product_id, file_name },
      });
      createdRecords.push(productImg.id);
    }
    res.status(201).json(createdRecords);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export { createProductImg };
