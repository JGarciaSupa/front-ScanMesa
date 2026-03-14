"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getPosTablesAction() {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/pos/tables`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getPosTablesAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function openPosSessionAction(tableId: number, guestName: string = "Mesa") {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const res = await fetch(`${API_URL}/tenant/orders/session/open`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ tableId, guestName, code }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error in openPosSessionAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
