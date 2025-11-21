import { computeResult } from "../src/utils/operations";

describe("computeResult", () => {
    it("adds numbers", () => {
        expect(computeResult(10, "ADD", 5)).toBe(15);
    });

    it("subtracts numbers", () => {
        expect(computeResult(10, "SUB", 3)).toBe(7);
    });

    it("multiplies numbers", () => {
        expect(computeResult(4, "MUL", 6)).toBe(24);
    });

    it("divides numbers", () => {
        expect(computeResult(12, "DIV", 3)).toBe(4);
    });
});