import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaClient";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

router.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body as {
            username?: string;
            password?: string;
        };

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(409).json({ message: "Username already taken" });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hash,
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        });

        return res.status(201).json(user);
    } catch (err) {
        console.error("register error", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body as {
            username?: string;
            password?: string;
        };

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ sub: user.id }, JWT_SECRET, {
            expiresIn: "1d",
        });

        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        });
    } catch (err) {
        console.error("login error", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
