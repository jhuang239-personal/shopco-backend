import { Request, Response } from "express";
import prisma from "../utils/prisma";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Internal server error";

const createReview = async (req: Request, res: Response) => {
  try {
    const { comment, rating, product_id } = req.body;
    const user_id: string = req.body.user.username;

    const user = await prisma.user.findUnique({ where: { username: user_id } });
    if (!user) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        comment,
        rating: parseInt(rating, 10),
        user_id,
        product_id,
      },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    const updated = await prisma.review.update({
      where: { id },
      data: {
        comment,
        rating: rating === undefined ? undefined : parseInt(rating, 10),
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    await prisma.review.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const getReviewByProductId = async (req: Request, res: Response) => {
  try {
    const product_id = req.params.id;
    const reviews = await prisma.review.findMany({ where: { product_id } });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

const getTop9Reviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      take: 9,
      orderBy: { rating: "desc" },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
};

export {
  createReview,
  updateReview,
  deleteReview,
  getReviewByProductId,
  getTop9Reviews,
};
