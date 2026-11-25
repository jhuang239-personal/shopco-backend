import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Internal Server Error";

const createCode = async (req: Request, res: Response) => {
  const { code, type, discount, start_date, end_date } = req.body;
  try {
    const newCode = await prisma.code.create({
      data: {
        code,
        type,
        discount: Number(discount),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });
    res.status(201).json(newCode);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const deleteCode = async (req: Request, res: Response) => {
  const { code } = req.params;
  try {
    const codeExists = await prisma.code.findFirst({ where: { code } });
    if (!codeExists) {
      res.status(404).json({ error: "Code not found" });
      return;
    }
    await prisma.code.delete({ where: { id: codeExists.id } });
    res.status(200).json({ message: "Code deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const getCode = async (req: Request, res: Response) => {
  const { code } = req.params;
  try {
    const codeExists = await prisma.code.findFirst({ where: { code } });
    if (!codeExists) {
      res.status(404).json({ error: "Code not found" });
      return;
    }
    res.status(200).json(codeExists);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

export { createCode, getCode, deleteCode };
