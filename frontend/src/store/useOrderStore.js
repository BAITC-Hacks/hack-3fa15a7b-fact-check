import { create } from "zustand";
import { getRecommendations, errorMessage } from "../services/api";
import { initialOrder, validateOrder, toPayload } from "../utils/order";

export const useOrderStore = create((set, get) => ({
  order: { ...initialOrder },
  result: null,
  error: null,
  loading: false,
  update: (field, value) => {
    if (!get().loading)
      set((state) => ({
        order: { ...state.order, [field]: value },
        result: null,
        error: null,
      }));
  },
  submit: async () => {
    if (get().loading) return;
    const order = { ...get().order };
    const error = validateOrder(order);
    if (error) return set({ error, result: null });
    set({ loading: true, error: null, result: null });
    try {
      set({ result: await getRecommendations(toPayload(order)) });
    } catch (error) {
      set({ error: errorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },
}));
