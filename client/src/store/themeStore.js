import { create } from "zustand";
import { persist } from "zustand/middleware";

const applyTheme = (theme) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

const themeStore = (set, get) => ({
  theme: "dark",
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    set({ theme: nextTheme });
  },
  initTheme: () => {
    applyTheme(get().theme);
  },
});

const useThemeStore = create(
  persist(themeStore, {
    name: "app-theme",
    onRehydrateStorage: () => (state) => {
      if (state) {
        applyTheme(state.theme);
      }
    },
  })
);

export default useThemeStore;
