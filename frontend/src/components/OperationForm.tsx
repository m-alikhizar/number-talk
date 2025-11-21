import { useState } from "react";
import { api } from "../api/client";

type OperationKind = "ADD" | "SUB" | "MUL" | "DIV";

interface OperationFormProps {
    threadId: string;
    parentId: string | null;
    onAfterCreate: () => void;
    disabled?: boolean;
}

export function OperationForm({
                                  threadId,
                                  parentId,
                                  onAfterCreate,
                                  disabled,
                              }: OperationFormProps) {
    const [op, setOp] = useState<OperationKind>("ADD");
    const [value, setValue] = useState<string>("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const rightOperand = Number(value);
        if (Number.isNaN(rightOperand)) return;

        await api("/operations", {
            method: "POST",
            body: JSON.stringify({
                threadId,
                parentId,
                operation: op,
                rightOperand,
            }),
        });

        setValue("");
        onAfterCreate();
    }

    if (disabled) {
        return (
            <div style={{ opacity: 0.45, fontSize: 12, marginTop: 4, paddingLeft: 2 }}>
                Log in to add operations
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 4, marginTop: 4 }}
        >
            <select
                value={op}
                onChange={(e) => setOp(e.target.value as OperationKind)}
            >
                <option value="ADD">+</option>
                <option value="SUB">−</option>
                <option value="MUL">×</option>
                <option value="DIV">÷</option>
            </select>
            <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                style={{ width: 80 }}
            />
            <button type="submit">Apply</button>
        </form>
    );
}