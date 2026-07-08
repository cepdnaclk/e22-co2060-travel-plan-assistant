import { useState } from "react";
import { Mail, Lock, LogIn, Loader2, UserPlus, FileText } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Mode = "login" | "register";

export function LoginModal() {
    const {
        showLoginModal,
        setShowLoginModal,
        login,
        register,
        pendingAction,
        setPendingAction,
    } = useAuth();

    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (mode === "login") {
            if (!email.trim() || !password.trim()) {
                setError("Please fill in all fields.");
                return;
            }

            try {
                setLoading(true);
                await login(email, password);
                setShowLoginModal(false);

                // Execute pending action (e.g. submit the trip form)
                if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                }

                // Reset form
                setEmail("");
                setPassword("");
            } catch (err: any) {
                setError(err.response?.data?.error || "Login failed. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
                setError("Please fill in all fields.");
                return;
            }

            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }

            if (password.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }

            try {
                setLoading(true);
                await register(name, email, password);
                setSuccessMessage("Account created successfully! Admin approval is pending. You can log in once approved.");
                setMode("login");
                setName("");
                setPassword("");
                setConfirmPassword("");
            } catch (err: any) {
                setError(err.response?.data?.error || "Registration failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setPendingAction(null);
            setError("");
            setSuccessMessage("");
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setMode("login");
        }
        setShowLoginModal(open);
    };

    return (
        <Dialog open={showLoginModal} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                <DialogHeader className="text-center items-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                        {mode === "login" ? (
                            <LogIn className="w-7 h-7 text-white" />
                        ) : (
                            <UserPlus className="w-7 h-7 text-white" />
                        )}
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {mode === "login"
                            ? "Sign in to access your travel plans and saved itineraries."
                            : "Register now. Accounts require administrator approval before use."}
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("login");
                            setError("");
                            setSuccessMessage("");
                        }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === "login"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("register");
                            setError("");
                            setSuccessMessage("");
                        }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === "register"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center font-medium">
                            {successMessage}
                        </div>
                    )}

                    {mode === "register" && (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="register-name"
                                className="text-sm font-medium text-gray-700"
                            >
                                Full Name
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="register-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    autoComplete="name"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="login-email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="login-password"
                            className="text-sm font-medium text-gray-700"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {mode === "register" && (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="register-confirm-password"
                                className="text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="register-confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    )}

                    <Button
                        id="login-submit-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-2 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-200 transition-all duration-300 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {mode === "login" ? "Signing in…" : "Registering…"}
                            </>
                        ) : (
                            <>
                                {mode === "login" ? (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Sign In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2" />
                                        Register Account
                                    </>
                                )}
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
