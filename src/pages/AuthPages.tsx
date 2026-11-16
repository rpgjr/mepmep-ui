import { Check, Circle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth";
import { emailProblem } from "../emailRules";
import { PASSWORD_RULES, passwordOk } from "../passwordRules";

const useFrom = () => (useLocation().state as { from?: string } | null)?.from ?? "/";

/** The sticker card every auth page sits in. */
function Shell({ title, description, onSubmit, children }: { title: string; description: string; onSubmit: (e: FormEvent) => void; children: ReactNode }) {
  return (
    <div className="relative grid min-h-[calc(100vh-8.5rem)] place-items-center overflow-hidden px-4 py-10 before:absolute before:-top-24 before:left-1/2 before:size-120 before:-translate-x-1/2 before:rounded-lg before:bg-primary/30 before:blur-3xl after:absolute after:right-[12%] after:bottom-[18%] after:size-40 after:rounded-lg after:bg-aqua/20 after:blur-3xl">
      <Card className="relative w-full max-w-100 rotate-1 rounded-3xl border-4 border-ink bg-card pop-lg shadow-[8px_8px_0_0_var(--primary)] ring-0">
        <form onSubmit={onSubmit} className="grid gap-4">
          <CardHeader>
            <p className="mb-1 font-heading text-3xl font-bold tracking-tight"><span className="text-sun">mep</span><span className="text-primary">mep</span><span className="text-aqua">!</span></p>
            <h1 className="text-xl font-bold">{title}</h1>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">{children}</CardContent>
        </form>
      </Card>
    </div>
  );
}

/** Live checklist under the password box. */
function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="grid gap-1 text-sm" aria-label="Rules for a good one">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.label} className={cn("flex items-center gap-2", ok ? "text-lime" : "text-muted-foreground")}>
            {ok ? <Check className="size-4" aria-hidden="true" /> : <Circle className="size-3 mx-0.5" aria-hidden="true" />}
            {r.label}
            <span className="sr-only">{ok ? "(done)" : "(missing)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

const ErrorAlert = ({ message }: { message: string }) =>
  message ? <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert> : null;

/** Shared form for login and register. */
function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const from = useFrom();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const isLogin = mode === "login";
  const emailError = !isLogin && touched ? emailProblem(email) : "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isLogin) await login(email, password);
      else await register(email, name, password);
      nav(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title={isLogin ? "Welcome back" : "Create your account"}
      description={isLogin ? "Log in to see your lists." : "Save favorites and pick up where you left off."}
      onSubmit={submit}
    >
      {!isLogin && (
        <div className="grid gap-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="nickname" />
        </div>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} required autoComplete="email"
          aria-invalid={emailError ? true : undefined} aria-describedby={emailError ? "email-error" : undefined} />
        {emailError && <p id="email-error" role="alert" className="text-sm font-semibold text-destructive">{emailError}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          autoComplete={isLogin ? "current-password" : "new-password"} />
        {!isLogin && <PasswordChecklist password={password} />}
      </div>
      <ErrorAlert message={error} />
      <Button type="submit" size="lg" disabled={busy || (!isLogin && (!passwordOk(password) || emailProblem(email) !== ""))}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? <>New here? <Link className="font-bold text-aqua hover:underline" to="/register">Create an account</Link></> : <>Have an account? <Link className="font-bold text-aqua hover:underline" to="/login">Log in</Link></>}
      </p>
    </Shell>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
