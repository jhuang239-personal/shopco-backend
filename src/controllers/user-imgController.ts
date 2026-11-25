import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An error occurred";

const createUserImg = async (req: Request, res: Response) => {
  try {
    const { user_id, file_name } = req.body as {
      user_id: string;
      file_name: string;
    };
    const userImg = await prisma.userImg.create({
      data: { user_id, file_name },
    });
    res.status(201).json(userImg);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const updateUserImg = async (req: Request, res: Response) => {
  try {
    const { id, user_id, file_name } = req.body as {
      id: string;
      user_id: string;
      file_name: string;
    };
    const userImg = await prisma.userImg.findUnique({ where: { id } });
    if (!userImg) {
      res.status(404).json({ error: "User image not found" });
      return;
    }
    const updated = await prisma.userImg.update({
      where: { id },
      data: { user_id, file_name },
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getUserImgById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userImg = await prisma.userImg.findUnique({ where: { id } });
    if (!userImg) {
      res.status(404).json({ error: "User image not found" });
      return;
    }
    res.status(200).json(userImg);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export { createUserImg, updateUserImg, getUserImgById };
