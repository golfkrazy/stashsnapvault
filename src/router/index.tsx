import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage.tsx";
import AuthGatewayPage from "../pages/AuthGatewayPage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ProtectedPage from "../pages/ProtectedPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../Providers.tsx";
import InventoryPage from "../pages/InventoryPage.tsx";
import AddItemPage from "../pages/AddItemPage.tsx";
import EditItemPage from "../pages/EditItemPage.tsx";
import TrashBinPage from "../pages/TrashBinPage.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import UserManagement from "../pages/UserManagement.tsx";
import SubscriptionManagement from "../pages/SubscriptionManagement.tsx";
// import UnauthorizedPage from "../pages/UnauthorizedPage.tsx"; // Commented out until file is restored

const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/welcome",
        element: <AuthGatewayPage />,
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/auth/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/inventory",
            element: <InventoryPage />,
          },
          {
            path: "/inventory/add",
            element: <AddItemPage />,
          },
          {
            path: "/inventory/edit/:id",
            element: <EditItemPage />,
          },
          {
            path: "/inventory/trash",
            element: <TrashBinPage />,
          },
        ],
      },
      // Admin Protected routes
      {
        path: "/admin",
        element: <AuthProtectedRoute requiredRole="admin" />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <UserManagement />,
          },
          {
            path: "subscriptions",
            element: <SubscriptionManagement />,
          },
        ],
      },
      /*
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
      */
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
