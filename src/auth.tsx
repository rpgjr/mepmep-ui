import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, post, setToken } from "./api";
import type { User } from "./types";

interface AuthValue {
  user: User | null;
  ready: boolean; // false until we know whether the saved token is still valid
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthValue>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!getToken());

  // On first load, ask the server who the saved token belongs to.
  useEffect(() => {
    if (!getToken()) return;
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const finish = (res: { token: string; user: User }) => {
    setToken(res.token);
    setUser(res.user);
  };

  const value: AuthValue = {
    user,
    ready,
    login: async (email, password) => finish(await post("/auth/login", { email, password })),
    register: async (email, displayName, password) =>
      finish(await post("/auth/register", { email, displayName, password })),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
