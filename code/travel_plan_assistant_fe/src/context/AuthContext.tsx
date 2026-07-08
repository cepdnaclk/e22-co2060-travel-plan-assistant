import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../axios";

interface User {
    userId: number;
    name: string;
    email: string;
    initials: string;
    role: "user" | "admin";
    status: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
    pendingAction: (() => void) | null;
    setPendingAction: (action: (() => void) | null) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Fetch user on mount if token exists
    useEffect(() => {
        async function fetchUser() {
            const token = localStorage.getItem("travelplan_auth_token");
            if (token) {
                try {
                    const res = await api.get<{ success: boolean; user: User }>("/api/auth/me");
                    if (res.data.success) {
                        setUser(res.data.user);
                    } else {
                        localStorage.removeItem("travelplan_auth_token");
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Token verification failed:", err);
                    localStorage.removeItem("travelplan_auth_token");
                    setUser(null);
                }
            }
            setLoading(false);
        }
        fetchUser();
    }, []);

    const login = useCallback(
        async (email: string, password: string) => {
            const res = await api.post<{ success: boolean; token: string; user: User }>("/api/auth/login", {
                email,
                password,
            });

            if (res.data.success) {
                localStorage.setItem("travelplan_auth_token", res.data.token);
                setUser(res.data.user);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        [],
    );

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            await api.post("/api/auth/register", {
                name,
                email,
                password,
            });
        },
        [],
    );

    const logout = useCallback(() => {
        localStorage.removeItem("travelplan_auth_token");
        setUser(null);
        setPendingAction(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                login,
                register,
                logout,
                showLoginModal,
                setShowLoginModal,
                pendingAction,
                setPendingAction,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
