import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const PublicRouteGaurd = () => {
    const { isAuthResolved, isLoggedIn } = useContext(AppContext);

    // Wait silently until the auth check (via HTTP-only cookie) is resolved
    if (!isAuthResolved) {
        return null; // Don't show anything, don't redirect yet
    }

    if(isLoggedIn){
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
};

export default PublicRouteGaurd;