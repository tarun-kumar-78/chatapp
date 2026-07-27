import { getItem } from "@/utils/storage";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
    const isAuthenticated = getItem("isAuthenticated");
    return (
        isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
    )
}

export default ProtectedRoute