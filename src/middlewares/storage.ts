import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { putFile, deleteFile } from "../utils/oci-storage";

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
};

const buildFileName = (originalname: string) =>
  `${Date.now()}_${originalname}`;

const sendError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  res.status(500).json({ error: message });
};

const uploadUserImageToStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    res.status(400).json({ error: "no file uploaded" });
    return;
  }
  try {
    const user_id = req.params.id;
    const oldFile = await prisma.userImg.findFirst({ where: { user_id } });
    if (oldFile) {
      await deleteFile(oldFile.file_name);
    }

    const file = req.file as UploadedFile;
    const fileName = buildFileName(file.originalname);
    await putFile(fileName, file.buffer, file.mimetype, {
      uploadedBy: "user",
      uploadedAt: new Date().toISOString(),
    });
    req.body.uploadedFile = fileName;
    next();
  } catch (error) {
    sendError(res, error);
  }
};

const uploadFilesToStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files) {
    res.status(400).json({ error: "no file uploaded" });
    return;
  }
  try {
    const uploadedFiles: string[] = [];
    await Promise.all(
      files.map(async (file) => {
        try {
          const fileName = buildFileName(file.originalname);
          await putFile(fileName, file.buffer, file.mimetype, {
            uploadedBy: "admin",
            uploadedAt: new Date().toISOString(),
          });
          uploadedFiles.push(fileName);
        } catch (error) {
          console.error(error);
        }
      })
    );
    req.body.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    sendError(res, error);
  }
};

const deleteFileFromStorageByImgIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let removedImages = req.body.removedImages;
    if (
      typeof removedImages === "string" &&
      removedImages !== "" &&
      removedImages.length > 0
    ) {
      removedImages = JSON.parse(removedImages);
    }

    if (Array.isArray(removedImages) && removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (image: { id: string; file_name: string }) => {
          await prisma.productImg.deleteMany({ where: { id: image.id } });
          await deleteFile(image.file_name);
        })
      );
    }
    next();
  } catch (error) {
    sendError(res, error);
  }
};

// Removes every stored file for a product before the product is deleted.
const deleteFileFromStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product_id = req.params.id;
    const productImgs = await prisma.productImg.findMany({
      where: { product_id },
    });
    await Promise.all(
      productImgs.map(async (productImg) => {
        try {
          await deleteFile(productImg.file_name);
        } catch (error) {
          console.error(error);
        }
      })
    );
    next();
  } catch (error) {
    sendError(res, error);
  }
};

const deleteUserImageFromStorage = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.id;
    const userImg = await prisma.userImg.findFirst({ where: { user_id } });
    if (!userImg) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    await deleteFile(userImg.file_name);
    await prisma.userImg.deleteMany({ where: { user_id } });
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    sendError(res, error);
  }
};

export {
  uploadFilesToStorage,
  deleteFileFromStorage,
  deleteFileFromStorageByImgIds,
  uploadUserImageToStorage,
  deleteUserImageFromStorage,
};
