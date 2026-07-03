import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import RepositoriesPage from "@/pages/RepositoriesPage";
import RulesPage from "@/pages/RulesPage";
import EventsPage from "@/pages/EventsPage";
import ActionsPage from "@/pages/ActionsPage";
import SettingsPage from "@/pages/SettingsPage";

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/repositories" element={<RepositoriesPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
