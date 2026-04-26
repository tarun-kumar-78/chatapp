import type { RootState } from "@/store"
import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    return (
        isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
    )
}

export default PublicRoute