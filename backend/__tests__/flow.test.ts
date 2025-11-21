import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prismaClient";

describe("Number Talk main flow", () => {
    let token: string;
    let threadId: string;

    beforeAll(async () => {
        // Reset DB for integration test
        await prisma.operationNode.deleteMany();
        await prisma.thread.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("health endpoint works", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
    });

    it("registers a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", password: "secret123" });

        expect(res.status).toBe(201);
        expect(res.body.username).toBe("testuser");
        expect(res.body.id).toBeDefined();
    });

    it("logs in and gets JWT", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "secret123" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe("testuser");
        token = res.body.token;
    });

    it("creates a thread (starting number)", async () => {
        const res = await request(app)
            .post("/api/threads")
            .set("Authorization", `Bearer ${token}`)
            .send({ value: 10 });

        expect(res.status).toBe(201);
        expect(res.body.value).toBe(10);
        threadId = res.body.id;
        expect(threadId).toBeDefined();
    });

    it("adds an ADD operation on the starting number", async () => {
        const res = await request(app)
            .post("/api/operations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                threadId,
                parentId: null,
                operation: "ADD",
                rightOperand: 5,
            });

        expect(res.status).toBe(201);
        expect(res.body.result).toBe(15);
    });

    it("fetches the calculation tree for the thread", async () => {
        const res = await request(app).get(`/api/threads/${threadId}/tree`);

        expect(res.status).toBe(200);
        expect(res.body.thread.value).toBe(10);
        expect(Array.isArray(res.body.operations)).toBe(true);
        expect(res.body.operations.length).toBe(1);

        const op = res.body.operations[0];
        expect(op.operation).toBe("ADD");
        expect(op.rightOperand).toBe(5);
        expect(op.result).toBe(15);
    });
});