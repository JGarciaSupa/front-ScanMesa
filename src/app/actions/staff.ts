"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

async function getAuthHeaders() {
  const slug = await getTenantSlugServer();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  return {
    "x-schema-tenant": slug || "",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

export async function getStaffAction() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/tenant/staff`, { headers });
    return await res.json();
  } catch (error) {
    console.error("Error in getStaffAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function saveStaffAction(data: any, id?: number) {
  try {
    const headers = await getAuthHeaders();
    const url = id 
      ? `${API_URL}/tenant/staff/${id}` 
      : `${API_URL}/tenant/staff`;
    
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/dashboard/staff");
    }
    return result;
  } catch (error) {
    console.error("Error in saveStaffAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function deleteStaffAction(id: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/tenant/staff/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/dashboard/staff");
    }
    return result;
  } catch (error) {
    console.error("Error in deleteStaffAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
