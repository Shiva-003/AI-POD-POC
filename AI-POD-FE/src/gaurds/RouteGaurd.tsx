import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RouteGaurd = () => {
  const { isAuthResolved, isLoggedIn, userData } = useContext(AppContext);
  const isVerified = userData?.isVerified;
  const location = useLocation();

  // Wait silently until the auth check (via HTTP-only cookie) is resolved
  if (!isAuthResolved) {
    return null; // Don't show anything, don't redirect yet
  }

  // 1. Not logged in → go to landing
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 2. Unverified user → allow /verify-email, block everything else
  if (!isVerified) {
    if (location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
  }

  // 3. Verified user → block /verify-email
  if (isVerified && location.pathname === '/verify-email') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Everything OK → allow route
  return <Outlet />;
};

export default RouteGaurd;