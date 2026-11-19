"use client";
/**
 * Client-side workspace state for the prototype: leads (seed + added), pipeline stages and toasts.
 * Added leads and pipeline moves persist per browser in localStorage, so a demo survives a refresh.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { leads as seedLeads, kanban as seedKanban, type Lead, type Temp } from "@/lib/data";

type Card = (typeof seedKanban)[string][number];
type Toast = { id: number; text: string; tone: "ok" | "info" };

interface Store {
  leads: Lead[];
  addLead: (l: Omit<Lead, "id">) => Lead;
  stages: Record<string, Card[]>;
  moveCard: (name: string, to: string) => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  toasts: Toast[];
  openLead: number | null;
  setOpenLead: (id: number | null) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "obs-demo-v2"; // v2: Emaar sample data; older saved boards are ignored

function load(): { added: Lead[]; stages: Record<string, Card[]> } | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<Lead[]>([]);
  const [stages, setStages] = useState<Record<string, Card[]>>(seedKanban);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [openLead, setOpenLead] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const seq = useRef(0);

  // Load once; only start saving after the stored state has been applied, so a save can never overwrite it with seeds.
  useEffect(() => {
    const s = load();
    if (s) {
      setAdded(s.added ?? []);
      if (s.stages) setStages(s.stages);
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify({ added, stages })); } catch {}
  }, [added, stages, hydrated]);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const addLead = useCallback((l: Omit<Lead, "id">) => {
    const lead = { ...l, id: 1000 + Date.now() % 100000 };
    setAdded((a) => [lead, ...a]);
    setStages((s) => ({ ...s, New: [{ name: lead.name, type: lead.type, time: "Just now", temp: lead.temp as Temp, score: lead.score, value: lead.budget }, ...s.New] }));
    return lead;
  }, []);

  const moveCard = useCallback((name: string, to: string) => {
    setStages((s) => {
      let card: Card | undefined;
      const next: Record<string, Card[]> = {};
      for (const [k, list] of Object.entries(s)) {
        next[k] = list.filter((c) => {
          if (c.name === name) { card = c; return false; }
          return true;
        });
      }
      if (card) next[to] = [card, ...next[to]];
      return next;
    });
  }, []);

  const resetDemo = useCallback(() => {
    setAdded([]);
    setStages(seedKanban);
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  const value = useMemo<Store>(() => ({
    leads: [...added, ...seedLeads], addLead, stages, moveCard, toast, toasts, openLead, setOpenLead, paletteOpen, setPaletteOpen, resetDemo,
  }), [added, addLead, stages, moveCard, toast, toasts, openLead, paletteOpen, resetDemo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
