import { useState } from "react";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";

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

export function LoginModal() {
    const {
        showLoginModal,
        setShowLoginModal,
        login,
        pendingAction,
        setPendingAction,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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
        } catch {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setPendingAction(null);
            setError("");
        }
        setShowLoginModal(open);
    };

    return (
        <Dialog open={showLoginModal} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                <DialogHeader className="text-center items-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <LogIn className="w-7 h-7 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Welcome Back
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Sign in to access your travel plans and saved itineraries.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        id="login-submit-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-200 transition-all duration-300 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                Sign In
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
