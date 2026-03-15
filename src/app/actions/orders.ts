"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function closeSessionAction(sessionId: number, paymentData?: { payerGuestId?: number, itemIds?: number[] }) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/orders/session/${sessionId}/close`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: paymentData ? JSON.stringify(paymentData) : undefined
    });

    return await res.json();
  } catch (error) {
    console.error("Error in closeSessionAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function getKdsOrdersAction() {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/kds/orders`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getKdsOrdersAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function markItemServedAction(itemId: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/kds/items/${itemId}/served`, {
      method: "PATCH",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in markItemServedAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function markOrderCompleteAction(sessionId: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/kds/sessions/${sessionId}/complete`, {
      method: "PATCH",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in markOrderCompleteAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function getSessionItemsAction(sessionId: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/orders/session/${sessionId}/items`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getSessionItemsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function resolveWaiterCallAction(callId: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/orders/waiter-call/${callId}/resolve`, {
      method: "POST",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in resolveWaiterCallAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
