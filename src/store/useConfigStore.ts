import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSettingsAction } from "@/app/actions/settings";

interface ConfigState {
  tenantName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  currency: string;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateLocally: (data: { name?: string; logoUrl?: string | null; bannerUrl?: string | null }) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      tenantName: "Cargando...",
      logoUrl: null,
      bannerUrl: null,
      currency: "USD",
      isLoading: false,
      error: null,

      fetchConfig: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await getSettingsAction();
          if (result.success && result.data) {
            set({
              tenantName: result.data.name,
              logoUrl: result.data.logoUrl,
              bannerUrl: result.data.bannerUrl,
              currency: result.data.currency || "USD",
              isLoading: false
            });
          } else {
            set({ error: result.error || "Error al cargar configuración", isLoading: false });
          }
        } catch (error) {
          set({ error: "Error de conexión", isLoading: false });
        }
      },

      updateLocally: (data) => {
        set((state) => ({
          tenantName: data.name !== undefined ? data.name : state.tenantName,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl : state.logoUrl,
          bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : state.bannerUrl,
        }));
      },
    }),
    {
      name: "tenant-config-storage",
      partialize: (state) => ({ 
        tenantName: state.tenantName, 
        logoUrl: state.logoUrl, 
        bannerUrl: state.bannerUrl,
        currency: state.currency 
      }),
    }
  )
);
