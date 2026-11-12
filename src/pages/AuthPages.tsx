import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="relative grid min-h-[calc(100vh-8.5rem)] place-items-center overflow-hidden px-4 py-10 before:absolute before:-top-24 before:left-1/2 before:size-120 before:-translate-x-1/2 before:rounded-full before:bg-primary/25 before:blur-3xl">
      <Card className="relative w-full max-w-100 bg-card/80 shadow-2xl backdrop-blur-xl">
        <form onSubmit={submit} className="grid gap-4">
          <CardHeader>
            <p className="mb-1 text-2xl font-extrabold tracking-tight">mep<span className="text-primary">mep</span></p>
            <h1 className="text-xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
            <CardDescription>{isLogin ? "Log in to see your lists." : "Save favorites and pick up where you left off."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="nickname" />
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isLogin ? 1 : 6}
                autoComplete={isLogin ? "current-password" : "new-password"} />
            </div>
            {error && (
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            )}
            <Button type="submit" size="lg" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</Button>
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? <>New here? <Link className="text-ring" to="/register">Create an account</Link></> : <>Have an account? <Link className="text-ring" to="/login">Log in</Link></>}
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
