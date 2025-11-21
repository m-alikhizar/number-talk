import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prismaClient";
import authRoutes from "./routes/auth";
import threadRoutes from "./routes/threads";
import operationRoutes from "./routes/operations";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/db-check", async (_req, res) => {
    const usersCount = await prisma.user.count();
    res.json({ usersCount });
});

app.use("/api/auth", authRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/operations", operationRoutes);