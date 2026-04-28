import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
    name: string;
    email: string;
    initials: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
    pendingAction: (() => void) | null;
    setPendingAction: (action: (() => void) | null) => void;
}

const AUTH_STORAGE_KEY = "travelplan_auth_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

function loadStoredUser(): User | null {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(loadStoredUser);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Sync user state to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [user]);

    const login = useCallback(
        async (email: string, _password: string) => {
            // Mock login — always succeeds after a short delay
            await new Promise((r) => setTimeout(r, 800));

            const name = email.split("@")[0];
            const initials = name
                .split(/[._-]/)
                .map((s) => s[0]?.toUpperCase() ?? "")
                .slice(0, 2)
                .join("");

            setUser({ name, email, initials: initials || "U" });
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [],
    );

    const logout = useCallback(() => {
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
                logout,
                showLoginModal,
                setShowLoginModal,
                pendingAction,
                setPendingAction,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
