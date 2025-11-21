import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
    userId?: string;
}

export function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.substring("Bearer ".length);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
        req.userId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}