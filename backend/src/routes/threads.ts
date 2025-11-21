import { Router, Response, Request } from "express";
import { prisma } from "../prismaClient";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/threads
 * Public – list all starting numbers (threads)
 */
router.get("/", async (_req: Request, res: Response) => {
    const threads = await prisma.thread.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { id: true, username: true } },
        },
    });

    res.json(
        threads.map((t) => ({
            id: t.id,
            value: t.value,
            createdAt: t.createdAt,
            author: t.author,
        })),
    );
});

/**
 * POST /api/threads
 * Auth required – create a new starting number
 * body: { value: number }
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    const { value } = req.body as { value?: number };

    if (typeof value !== "number" || Number.isNaN(value)) {
        return res.status(400).json({ message: "value must be a number" });
    }

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thread = await prisma.thread.create({
        data: {
            value,
            authorId: req.userId,
        },
        include: {
            author: { select: { id: true, username: true } },
        },
    });

    return res.status(201).json({
        id: thread.id,
        value: thread.value,
        createdAt: thread.createdAt,
        author: thread.author,
    });
});

/**
 * GET /api/threads/:id/tree
 * Public – full calculation tree for one thread
 */
router.get("/:id/tree", async (req: Request, res: Response) => {
    const { id } = req.params;

    const thread = await prisma.thread.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, username: true } },
        },
    });

    if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
    }

    const nodes = await prisma.operationNode.findMany({
        where: { threadId: id },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { id: true, username: true } },
        },
    });

    return res.json({
        thread: {
            id: thread.id,
            value: thread.value,
            createdAt: thread.createdAt,
            author: thread.author,
        },
        operations: nodes.map((n) => ({
            id: n.id,
            threadId: n.threadId,
            parentId: n.parentId,
            operation: n.operation,
            rightOperand: n.rightOperand,
            result: n.result,
            createdAt: n.createdAt,
            author: n.author,
        })),
    });
});

export default router;