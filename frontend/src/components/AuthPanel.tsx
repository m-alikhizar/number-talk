import { useState } from "react";
import { api } from "../api/client";

interface AuthPanelProps {
    onAuthSuccess: (params: { token: string; user: { id: string; username: string } }) => void;
}

export function AuthPanel({ onAuthSuccess }: AuthPanelProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === "register") {
                await api("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ username, password }),
                });
            }

            const data = await api<{ token: string; user: { id: string; username: string } }>(
                "/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({ username, password }),
                },
            );

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            onAuthSuccess(data);
        } catch (err: any) {
            setError(err.message ?? "Auth failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <div style={{ color: "red", fontSize: 12 }}>{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? "Please wait…" : mode === "login" ? "Login" : "Register & Login"}
                </button>
            </form>
            <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                style={{ marginTop: 8, fontSize: 12 }}
            >
                {mode === "login" ? "Create a new account" : "Already have an account? Login"}
            </button>
        </div>
    );
}