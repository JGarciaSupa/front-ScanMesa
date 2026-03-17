"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getInvoicesAction(options: { page?: number, limit?: number, search?: string } = {}) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const { page = 1, limit = 10, search = "" } = options;
    const url = new URL(`${API_URL}/tenant/invoices`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    if (search) url.searchParams.append("search", search);

    const res = await fetch(url.toString(), {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getInvoicesAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function getInvoiceStatsAction(options: { search?: string } = {}) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const { search = "" } = options;
    const url = new URL(`${API_URL}/tenant/invoices/stats`);
    if (search) url.searchParams.append("search", search);

    const res = await fetch(url.toString(), {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getInvoiceStatsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function getInvoiceDetailsAction(id: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/invoices/${id}`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getInvoiceDetailsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
