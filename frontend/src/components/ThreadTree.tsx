import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { OperationForm } from "./OperationForm";

interface ThreadTreeProps {
    threadId: string | null;
    isAuthenticated: boolean;
}

type OperationKind = "ADD" | "SUB" | "MUL" | "DIV";

interface OperationNode {
    id: string;
    threadId: string;
    parentId: string | null;
    operation: OperationKind | string;
    rightOperand: number;
    result: number;
    createdAt: string;
    author: { id: string; username: string };
}

interface ThreadTreeResponse {
    thread: {
        id: string;
        value: number;
        createdAt: string;
        author: { id: string; username: string };
    };
    operations: OperationNode[];
}

export function ThreadTree({ threadId, isAuthenticated }: ThreadTreeProps) {
    const [data, setData] = useState<ThreadTreeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadTree() {
        if (!threadId) return;
        setLoading(true);
        setError(null);
        try {
            const resp = await api<ThreadTreeResponse>(`/threads/${threadId}/tree`);
            setData(resp);
        } catch (err: any) {
            setError(err.message ?? "Failed to load tree");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setData(null);
        if (threadId) {
            loadTree();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threadId]);

    const treeByParent = useMemo(() => {
        const map = new Map<string | null, OperationNode[]>();
        if (!data) return map;
        for (const node of data.operations) {
            const key = node.parentId ?? null;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(node);
        }
        return map;
    }, [data]);

    function renderChildren(parentId: string | null, depth: number): JSX.Element | null {
        const nodes = treeByParent.get(parentId);
        if (!nodes || nodes.length === 0) return null;

        return (
            <ul style={{ listStyle: "none", paddingLeft: depth * 16 }}>
                {nodes.map((n) => (
                    <li key={n.id} style={{ marginBottom: 6 }}>
                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 6,
                                padding: 8,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <div style={{ fontSize: 13 }}>
                                <strong>
                                    {n.operation} {n.rightOperand}
                                </strong>{" "}
                                → result: {n.result}
                            </div>
                            <div style={{ fontSize: 11, color: "#777" }}>
                                by {n.author.username} • {new Date(n.createdAt).toLocaleString()}
                            </div>
                            {isAuthenticated && (
                                <OperationForm
                                    threadId={n.threadId}
                                    parentId={n.id}
                                    onAfterCreate={loadTree}
                                />
                            )}
                        </div>
                        {renderChildren(n.id, depth + 1)}
                    </li>
                ))}
            </ul>
        );
    }

    if (!threadId) {
        return <div>Select a starting number to see its calculation tree.</div>;
    }

    if (loading && !data) return <div>Loading…</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!data) return null;

    const { thread } = data;

    return (
        <div>
            <h2>Calculation tree</h2>
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    backgroundColor: "#fff",
                }}
            >
                <div>
                    <strong>Starting number:</strong> {thread.value}
                </div>
                <div style={{ fontSize: 12, color: "#777" }}>
                    by {thread.author.username} • {new Date(thread.createdAt).toLocaleString()}
                </div>
                {isAuthenticated && (
                    <OperationForm
                        threadId={thread.id}
                        parentId={null}
                        onAfterCreate={loadTree}
                    />
                )}
            </div>

            {renderChildren(null, 1)}
        </div>
    );
}