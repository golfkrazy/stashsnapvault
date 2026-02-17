import { Outlet, Navigate } from "react-router-dom";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import { useSession } from "../context/SessionContext";

interface Props {
  requiredRole?: 'user' | 'admin';
}

const AuthProtectedRoute = ({ requiredRole }: Props) => {
  const { session, profile, loading } = useSession();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!session) {
    // If not logged in, redirect to sign-in or Unauthorized
    // For better UX, we might want to redirect to /auth/sign-in
    return <UnauthorizedPage />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // If user is logged in but doesn't have the required role, 
    // we can redirect them to a specific unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthProtectedRoute;
