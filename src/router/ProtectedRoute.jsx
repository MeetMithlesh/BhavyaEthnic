import { Navigate, useLocation } from "react-router-dom";
import { useShopStore } from "../stores/useShopStore";

export function ProtectedRoute({ children }) {
  const user = useShopStore((state) => state.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function AdminRoute({ children }) {
  const user = useShopStore((state) => state.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "Admin") return <Navigate to="/dashboard" replace />;
  return children;
}
