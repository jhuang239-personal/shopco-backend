import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const addStyle = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    const style = await prisma.dressStyle.create({ data: { name } });
    res.status(201).json(style);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const getStyles = async (req: Request, res: Response) => {
  try {
    const styles = await prisma.dressStyle.findMany();
    res.status(200).json(styles);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

export { addStyle, getStyles };
