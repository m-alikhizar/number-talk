import { Router, Response } from "express";
import { prisma } from "../prismaClient";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { computeResult, OperationKind } from "../utils/operations";

const router = Router();

const ALLOWED_OPS = ["ADD", "SUB", "MUL", "DIV"] as const;

/**
 * POST /api/operations
 * Auth required
 * body: { threadId, parentId?, operation, rightOperand }
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { threadId, parentId, operation, rightOperand } = req.body as {
            threadId?: string;
            parentId?: string | null;
            operation?: string;
            rightOperand?: number;
        };

        if (!threadId) {
            return res.status(400).json({ message: "threadId is required" });
        }

        if (typeof rightOperand !== "number" || Number.isNaN(rightOperand)) {
            return res
                .status(400)
                .json({ message: "rightOperand must be a number" });
        }

        if (!operation || !ALLOWED_OPS.includes(operation as OperationKind)) {
            return res
                .status(400)
                .json({ message: "operation must be ADD | SUB | MUL | DIV" });
        }

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // make sure thread exists
        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
        });
        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });
        }

        // determine base value (left operand)
        let base: number;

        if (parentId) {
            const parent = await prisma.operationNode.findUnique({
                where: { id: parentId },
            });

            if (!parent || parent.threadId !== threadId) {
                return res
                    .status(400)
                    .json({ message: "Invalid parentId for this thread" });
            }

            base = parent.result;
        } else {
            base = thread.value;
        }

        if (operation === "DIV" && rightOperand === 0) {
            return res.status(400).json({ message: "Division by zero is not allowed" });
        }

        const result = computeResult(base, operation as OperationKind, rightOperand);

        const node = await prisma.operationNode.create({
            data: {
                threadId,
                parentId: parentId ?? null,
                operation,
                rightOperand,
                result,
                authorId: req.userId,
            },
            include: {
                author: { select: { id: true, username: true } },
            },
        });

        return res.status(201).json({
            id: node.id,
            threadId: node.threadId,
            parentId: node.parentId,
            operation: node.operation,
            rightOperand: node.rightOperand,
            result: node.result,
            createdAt: node.createdAt,
            author: node.author,
        });
    } catch (err) {
        console.error("create operation error", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;