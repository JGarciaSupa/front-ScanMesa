"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getTablesAction() {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/tables`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getTablesAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function saveTableAction(data: any, id?: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const url = id 
      ? `${API_URL}/tenant/tables/${id}` 
      : `${API_URL}/tenant/tables`;
    
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (error) {
    console.error("Error in saveTableAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function deleteTableAction(id: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/tables/${id}`, {
      method: "DELETE",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in deleteTableAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
