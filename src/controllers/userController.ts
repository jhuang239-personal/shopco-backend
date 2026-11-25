import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { hashPassword } from "../middlewares/authentication";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const updateUser = async (req: Request, res: Response) => {
  try {
    const username = req.params.id;
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const hashedPassword = await hashPassword(password);

    const result = await prisma.user.updateMany({
      where: { username },
      data: { username, email, password: hashedPassword },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { username } = req.body as { username: string };
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const uploadUserImage = async (req: Request, res: Response) => {
  try {
    const username = req.params.id;
    const userImage = await prisma.userImg.findFirst({
      where: { user_id: username },
    });
    if (userImage) {
      await prisma.userImg.updateMany({
        where: { user_id: username },
        data: { file_name: req.body.uploadedFile },
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        res.status(400).json({ error: "User does not exist" });
        return;
      }
      await prisma.userImg.create({
        data: { user_id: username, file_name: req.body.uploadedFile },
      });
    }
    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export { updateUser, getUsers, getUserById, uploadUserImage };
