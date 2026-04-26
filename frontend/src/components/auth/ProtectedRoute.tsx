import type { RootState } from "@/store"
import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    return (
        isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
    )
}

export default ProtectedRoute