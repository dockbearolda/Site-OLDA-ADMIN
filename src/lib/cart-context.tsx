"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  ref: string;
  label: string;
  quantity: number;
  prixAchat?: number;   // Prix B2B (investissement client)
  prixRevente?: number; // Prix public conseillé (CA potentiel)
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  // Métriques financières (Feature 1 : Moteur de Marge)
  totalB2B: number;
  totalRevente: number;
  margeNette: number;
  /** Coefficient de marge = Marge Brute / Coût Achat HT  (ex: 1.50 = 150 % de marge) */
  coeffMarge: number;
  hasPrices: boolean;
  add: (ref: string, label: string, quantity?: number, prixAchat?: number, prixRevente?: number) => void;
  remove: (ref: string) => void;
  updateQuantity: (ref: string, quantity: number) => void;
  clear: () => void;
  /** Remplace atomiquement le contenu du panier (utilisé par les Projets). */
  replace: (items: CartItem[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "olda-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded — silent */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const add = useCallback(
    (ref: string, label: string, quantity = 1, prixAchat?: number, prixRevente?: number) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.ref === ref);
        if (existing) {
          return prev.map((i) =>
            i.ref === ref
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                  // Mettre à jour les prix si fournis
                  ...(prixAchat != null ? { prixAchat } : {}),
                  ...(prixRevente != null ? { prixRevente } : {}),
                }
              : i,
          );
        }
        return [...prev, { ref, label, quantity, prixAchat, prixRevente }];
      });
    },
    [],
  );

  const remove = useCallback((ref: string) => {
    setItems((prev) => prev.filter((i) => i.ref !== ref));
  }, []);

  const updateQuantity = useCallback((ref: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.ref !== ref));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.ref === ref ? { ...i, quantity } : i)),
      );
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const replace = useCallback((newItems: CartItem[]) => {
    setItems(newItems.map((i) => ({ ...i })));
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalB2B = useMemo(
    () => items.reduce((sum, i) => sum + (i.prixAchat ?? 0) * i.quantity, 0),
    [items],
  );

  const totalRevente = useMemo(
    () => items.reduce((sum, i) => sum + (i.prixRevente ?? 0) * i.quantity, 0),
    [items],
  );

  const margeNette = useMemo(
    () => totalRevente - totalB2B,
    [totalRevente, totalB2B],
  );

  const coeffMarge = useMemo(
    () => (totalB2B > 0 ? margeNette / totalB2B : 0),
    [margeNette, totalB2B],
  );

  const hasPrices = useMemo(
    () => items.some((i) => i.prixAchat != null && i.prixAchat > 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalB2B,
      totalRevente,
      margeNette,
      coeffMarge,
      hasPrices,
      add,
      remove,
      updateQuantity,
      clear,
      replace,
    }),
    [items, totalItems, totalB2B, totalRevente, margeNette, coeffMarge, hasPrices, add, remove, updateQuantity, clear, replace],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
