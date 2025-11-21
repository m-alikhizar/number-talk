import { useEffect, useState } from "react";
import { api } from "./api/client";
import { AuthPanel } from "./components/AuthPanel";
import { ThreadList } from "./components/ThreadList";
import { ThreadTree } from "./components/ThreadTree";

interface User {
    id: string;
    username: string;
}

function App() {
    const [health, setHealth] = useState<string>("…loading");
    const [user, setUser] = useState<User | null>(null);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    useEffect(() => {
        api<{ status: string }>("/health")
            .then((data) => setHealth(data.status))
            .catch((err) => setHealth("error: " + err.message));
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                // ignore
            }
        }
    }, []);

    const isAuthenticated = !!user;

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
            <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Number Talk</h1>
                    <div style={{ fontSize: 12, color: "#666" }}>Backend health: {health}</div>
                </div>
                <div>
                    {isAuthenticated ? (
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13 }}>Logged in as {user?.username}</div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{ fontSize: 12, marginTop: 4 }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize: 13, color: "#666" }}>Not logged in</div>
                    )}
                </div>
            </header>

            {!isAuthenticated && (
                <AuthPanel
                    onAuthSuccess={({ token, user: u }) => {
                        localStorage.setItem("token", token);
                        localStorage.setItem("user", JSON.stringify(u));
                        setUser(u);
                    }}
                />
            )}

            {!isAuthenticated && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        background: "#fff8e5",
                        border: "1px solid #ffe4b3",
                        borderRadius: 6,
                        fontSize: 14,
                        color: "#8a6d3b",
                    }}
                >
                    You can browse all calculations, threads, and results.
                    <strong>Log in</strong> to start a new calculation or reply with operations.
                </div>
            )}

            <main style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <section>
                    <ThreadList
                        selectedThreadId={selectedThreadId}
                        onSelectThread={setSelectedThreadId}
                        isAuthenticated={isAuthenticated}
                    />
                </section>
                <section>
                    <ThreadTree threadId={selectedThreadId} isAuthenticated={isAuthenticated} />
                </section>
            </main>
        </div>
    );
}

export default App;