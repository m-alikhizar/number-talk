export type OperationKind = "ADD" | "SUB" | "MUL" | "DIV";

export function computeResult(base: number, op: OperationKind, right: number): number {
    switch (op) {
        case "ADD":
            return base + right;
        case "SUB":
            return base - right;
        case "MUL":
            return base * right;
        case "DIV":
            return base / right;
        default:
            throw new Error("Unsupported operation");
    }
}