"use client";

/**
 * Stato globale del carrello (client): righe + sconto, persistiti in
 * localStorage. Espone azioni e totali derivati, oltre allo stato del drawer.
 * Il calcolo dei totali è delegato alle funzioni pure di `pricing.ts`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { computeTotals } from "./pricing";
import type { AppliedDiscount, CartLine, CartState, CartTotals } from "./types";

const STORAGE_KEY = "tdt-cart-v1";

interface CartContextValue {
  lines: CartLine[];
  discount: AppliedDiscount | null;
  totals: CartTotals;
  /** true dopo l'idratazione da localStorage (evita mismatch SSR). */
  ready: boolean;
  isOpen: boolean;
  /** Aggiunge una riga; se lo SKU esiste, somma le quantità (clamp allo stock). */
  addLine: (line: CartLine) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeLine: (sku: string) => void;
  clear: () => void;
  applyDiscount: (discount: AppliedDiscount | null) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(qty: number, max: number): number {
  return Math.max(1, Math.min(qty, Math.max(1, max)));
}

function loadState(): CartState {
  if (typeof window === "undefined") return { lines: [], discount: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], discount: null };
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.lines)) return { lines: [], discount: null };
    return { lines: parsed.lines, discount: parsed.discount ?? null };
  } catch {
    return { lines: [], discount: null };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ lines: [], discount: null });
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Idratazione dopo il mount (una sola volta).
  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  // Persistenza a ogni cambiamento (solo dopo l'idratazione).
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage pieno o non disponibile: ignora */
    }
  }, [state, ready]);

  // Sincronizza tra tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(loadState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Blocco scroll quando il drawer è aperto (compatibile con Lenis).
  const lenisRef = useRef<{ stop: () => void; start: () => void } | undefined>(
    undefined,
  );
  useEffect(() => {
    lenisRef.current = (
      window as unknown as { lenis?: { stop: () => void; start: () => void } }
    ).lenis;
    const lenis = lenisRef.current;
    if (isOpen) {
      document.documentElement.classList.add("no-scroll");
      lenis?.stop();
    } else {
      document.documentElement.classList.remove("no-scroll");
      lenis?.start();
    }
    return () => {
      document.documentElement.classList.remove("no-scroll");
    };
  }, [isOpen]);

  // Chiudi con ESC.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const addLine = useCallback((line: CartLine) => {
    setState((prev) => {
      const existing = prev.lines.find((l) => l.id === line.id);
      const lines = existing
        ? prev.lines.map((l) =>
            l.id === line.id
              ? { ...l, quantity: clampQty(l.quantity + line.quantity, l.maxStock) }
              : l,
          )
        : [...prev.lines, { ...line, quantity: clampQty(line.quantity, line.maxStock) }];
      return { ...prev, lines };
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      lines:
        quantity <= 0
          ? prev.lines.filter((l) => l.id !== sku)
          : prev.lines.map((l) =>
              l.id === sku ? { ...l, quantity: clampQty(quantity, l.maxStock) } : l,
            ),
    }));
  }, []);

  const removeLine = useCallback((sku: string) => {
    setState((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.id !== sku) }));
  }, []);

  const clear = useCallback(() => {
    setState({ lines: [], discount: null });
  }, []);

  const applyDiscount = useCallback((discount: AppliedDiscount | null) => {
    setState((prev) => ({ ...prev, discount }));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totals = useMemo(
    () => computeTotals(state.lines, state.discount),
    [state.lines, state.discount],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      discount: state.discount,
      totals,
      ready,
      isOpen,
      addLine,
      setQuantity,
      removeLine,
      clear,
      applyDiscount,
      openCart,
      closeCart,
    }),
    [
      state.lines,
      state.discount,
      totals,
      ready,
      isOpen,
      addLine,
      setQuantity,
      removeLine,
      clear,
      applyDiscount,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve essere usato dentro <CartProvider>.");
  return ctx;
}
