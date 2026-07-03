import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { authService } from "@/services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authService.getCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser: fetchUser,
    }),
    [user, isLoading, login, logout, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
