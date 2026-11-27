import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  /** Returns true when the product was added, false when it was removed. */
  toggle: (id: string) => boolean;
}

/** Saved products live in this browser only (localStorage). They are not tied to the account. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const saved = get().ids.includes(id);
        set({ ids: saved ? get().ids.filter((i) => i !== id) : [...get().ids, id] });
        return !saved;
      },
    }),
    { name: "forme-wishlist" },
  ),
);
