import { Request, Response } from "express";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../middlewares/authentication";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        type: "user",
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }
    const token = generateToken({
      username: user.username,
      email: user.email,
      type: user.type,
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
};

export { registerUser, loginUser };
