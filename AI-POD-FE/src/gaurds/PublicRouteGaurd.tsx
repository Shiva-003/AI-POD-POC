import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const PublicRouteGaurd = () => {
    const {isLoggedIn} = useContext(AppContext);

    if(isLoggedIn){
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
};

export default PublicRouteGaurd;