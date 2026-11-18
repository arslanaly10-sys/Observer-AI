"use client";
/**
 * Demo role: who the visitor entered as on the sign-in page (Chairman, Sales director, Consultant,
 * Broker partner). Kept in a cookie so a refresh or a shared tab keeps the same seat.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { roles, type RoleId } from "@/lib/demo/group";

const KEY = "obs-role";
const Ctx = createContext<{ role: RoleId; setRole: (r: RoleId) => void; ready: boolean }>({ role: "director", setRole: () => {}, ready: false });

export function readRole(): RoleId | null {
  try {
    const m = document.cookie.match(/(?:^|; )obs-role=([a-z]+)/);
    return m && m[1] in roles ? (m[1] as RoleId) : null;
  } catch {
    return null;
  }
}
export function writeRole(r: RoleId) {
  try { document.cookie = `${KEY}=${r}; path=/; max-age=2592000; samesite=lax`; } catch {}
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, set] = useState<RoleId>("director");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const r = readRole();
    if (r) set(r);
    setReady(true);
  }, []);
  const setRole = useCallback((r: RoleId) => { writeRole(r); set(r); }, []);
  return <Ctx.Provider value={{ role, setRole, ready }}>{children}</Ctx.Provider>;
}

export function useRole() {
  return useContext(Ctx);
}
