import { FormEvent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthPage = ({ mode }: { mode: "login" | "register" }) => {
  const { login, register } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); try { if (mode === "login") await login(email, password); else await register(name, email, password); navigate((location.state as { from?: string })?.from || "/"); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível autenticar"); } };
  return <main className="page_content"><h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2><form onSubmit={submit} className="auth_form">{mode === "register" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required minLength={2} />
  }<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha (mínimo 8 caracteres)" required minLength={8} /><button type="submit">Continuar</button></form>{error && <p role="alert">{error}</p>}</main>;
};
export default AuthPage;
