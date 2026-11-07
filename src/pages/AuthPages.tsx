import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

/** Shared form for login and register. */
function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, name, password);
      nav(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === "login";
  return (
    <div className="auth">
      <form onSubmit={submit} className="auth-card">
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">{isLogin ? "Log in to see your lists." : "Save favorites and pick up where you left off."}</p>
        {!isLogin && (
          <label>Display name
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="nickname" />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isLogin ? 1 : 6}
            autoComplete={isLogin ? "current-password" : "new-password"} />
        </label>
        {error && <p className="error-box" role="alert">{error}</p>}
        <button className="btn block" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</button>
        <p className="muted center">
          {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Have an account? <Link to="/login">Log in</Link></>}
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
