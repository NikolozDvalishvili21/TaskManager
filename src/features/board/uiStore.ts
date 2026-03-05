import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  addToast: (message, type) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
