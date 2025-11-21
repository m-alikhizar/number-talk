import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Thread {
    id: string;
    value: number;
    createdAt: string;
    author: { id: string; username: string };
}

interface ThreadListProps {
    selectedThreadId: string | null;
    onSelectThread: (id: string) => void;
    isAuthenticated: boolean;
}

export function ThreadList({ selectedThreadId, onSelectThread, isAuthenticated }: ThreadListProps) {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [newValue, setNewValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    async function loadThreads() {
        try {
            const data = await api<Thread[]>("/threads");
            setThreads(data);
        } catch (err: any) {
            setError(err.message ?? "Failed to load threads");
        }
    }

    useEffect(() => {
        loadThreads();
    }, []);

    async function handleCreateThread(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const value = Number(newValue);
        if (Number.isNaN(value)) {
            setError("Starting number must be valid");
            return;
        }

        try {
            await api("/threads", {
                method: "POST",
                body: JSON.stringify({ value }),
            });
            setNewValue("");
            await loadThreads();
        } catch (err: any) {
            setError(err.message ?? "Failed to create thread");
        }
    }

    return (
        <div>
            <h2>Starting numbers</h2>
            {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}

            {isAuthenticated && (
                <form onSubmit={handleCreateThread} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                        New starting number:
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            type="number"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            required
                        />
                        <button type="submit">Create</button>
                    </div>
                </form>
            )}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {threads.map((t) => (
                    <li key={t.id} style={{ marginBottom: 6 }}>
                        <button
                            type="button"
                            onClick={() => onSelectThread(t.id)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                padding: 8,
                                borderRadius: 6,
                                border: t.id === selectedThreadId ? "2px solid #2979ff" : "1px solid #ddd",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            <div>
                                <strong>{t.value}</strong>{" "}
                                <span style={{ fontSize: 12, color: "#666" }}>by {t.author.username}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#999" }}>
                                {new Date(t.createdAt).toLocaleString()}
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}