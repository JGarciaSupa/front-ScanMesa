"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getCategoriesAction() {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/categories`, {
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in getCategoriesAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function saveCategoryAction(data: any, id?: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const url = id 
      ? `${API_URL}/tenant/categories/${id}` 
      : `${API_URL}/tenant/categories`;
    
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
    console.error("Error in saveCategoryAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/categories/${id}`, {
      method: "DELETE",
      headers: {
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Error in deleteCategoryAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function toggleCategoryActiveAction(id: number, isActive: boolean) {
  try {
    const slug = await getTenantSlugServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const res = await fetch(`${API_URL}/tenant/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ isActive }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error in toggleCategoryActiveAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
