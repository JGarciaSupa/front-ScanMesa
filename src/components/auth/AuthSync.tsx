"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getSessionServer } from "@/app/actions/auth";

export default function AuthSync() {
  const { user, setUser, _hasHydrated } = useAuthStore();

  useEffect(() => {
    async function sync() {
      if (_hasHydrated && !user) {
        // Si ya hidrató Zustand y no hay usuario, checar si hay sesión en el servidor
        const session = await getSessionServer();
        if (session && session.user) {
          setUser(session.user);
        }
      }
    }
    sync();
  }, [_hasHydrated, user, setUser]);

  return null;
}
