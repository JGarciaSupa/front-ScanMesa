"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getProductsAction() {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/products`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getProductsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function saveProductAction(formData: FormData, id?: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const url = id 
      ? `${API_URL}/tenant/products/${id}` 
      : `${API_URL}/tenant/products`;
    
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData,
    });

    return await res.json();
  } catch (error) {
    console.error("Error in saveProductAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/products/${id}`, {
      method: "DELETE",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in deleteProductAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function toggleProductAvailableAction(id: number, isAvailable: boolean) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ isAvailable }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error in toggleProductAvailableAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
