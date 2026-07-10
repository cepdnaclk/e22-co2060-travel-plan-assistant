import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
    const { isAuthenticated, setShowLoginModal, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            setShowLoginModal(true);
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, loading, setShowLoginModal, navigate]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">Checking authorization...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <Outlet />;
}
