import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export function AdminRoute() {
    const { isAuthenticated, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || user?.role !== "admin") {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">Checking authorization...</p>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "admin") return null;

    return <Outlet />;
}
