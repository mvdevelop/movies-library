import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as auth from "../services/auth";

type AuthContextValue = { user: auth.User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => Promise<void>; };
const AuthContext = createContext<AuthContextValue | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<auth.User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { auth.currentUser().then(({ user }) => setUser(user)).catch(() => localStorage.removeItem("movies_token")).finally(() => setLoading(false)); }, []);
  const login = async (email: string, password: string) => { const result = await auth.login(email, password); localStorage.setItem("movies_token", result.token); setUser(result.user); };
  const register = async (name: string, email: string, password: string) => { await auth.register(name, email, password); await login(email, password); };
  const logout = async () => { await auth.logout().catch(() => undefined); localStorage.removeItem("movies_token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider"); return context; };
