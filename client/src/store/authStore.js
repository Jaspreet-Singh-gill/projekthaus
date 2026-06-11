import { create } from "zustand";
import { persist } from "zustand/middleware";

const authStore = (set) => ({
  user: null,
  setTheUser: (userData) => {
    set({ user: userData });
  },
  clearTheUser: () => {
    set({ user: null });
  },
});

const useAuthStore = create(presist(authStore), {
  name: "user-data",
  partialize: (state) => ({ user: state.user }),
});

export default useAuthStore;
