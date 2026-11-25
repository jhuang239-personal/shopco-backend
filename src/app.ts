require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import express, { Express } from "express";
import prisma from "./utils/prisma";
import cors from "cors";
//* routes
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import cartRoute from "./routes/cartRoute";
import authRoute from "./routes/authRoute";
import adminRoute from "./routes/adminRoute";
import reviewRoute from "./routes/reviewRoute";
import reviewPublicRoute from "./routes/reviewPublicRoute";
import categoryRoute from "./routes/categoryRoute";
import brandRoute from "./routes/brandRoute";
import styleRoute from "./routes/styleRoute";
//* swagger
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import config from "./swagger.config";

//* middleware
import { isAuthenticated, isAdmin } from "./middlewares/authentication";

const app: Express = express();
const PORT = process.env.PORT || 3000;

const swaggerSpec = swaggerJSDoc(config);

// Add these middleware before your routes
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json()); // <-- This is required to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // <-- This is for parsing URL-encoded bodies

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/user", isAuthenticated, userRoute);
app.use("/products", productRoute);
app.use("/auth", authRoute);
app.use("/cart", isAuthenticated, cartRoute);
app.use("/review", isAuthenticated, reviewRoute);
app.use("/reviewPublic", reviewPublicRoute);
app.use("/categories", categoryRoute);
app.use("/admin", isAdmin, adminRoute);
app.use("/brands", brandRoute);
app.use("/styles", styleRoute);

app.get("/", (req, res) => {
    res.send("Hello World 123!");
});

// Schema is managed by Prisma Migrate (`prisma migrate deploy`), not sync().
prisma
    .$connect()
    .then(() => console.log("Database connected"))
    .catch((error) => console.error("Database connection failed", error));

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
