import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, setShowLoginModal, navigate]);

    if (!isAuthenticated) return null;

    return <Outlet />;
}
