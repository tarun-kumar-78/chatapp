
import { getItem } from "@/utils/storage";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
    const isAuthenticated = getItem("isAuthenticated");
    return (
        isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
    )
}

export default PublicRoute