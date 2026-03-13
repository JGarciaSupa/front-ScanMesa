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

export async function getSettingsAction() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/tenant/settings`, { headers });
    return await res.json();
  } catch (error) {
    console.error("Error in getSettingsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}

export async function updateSettingsAction(data: any) {
  try {
    const headers = await getAuthHeaders();
    
    const isFormData = data instanceof FormData;

    const res = await fetch(`${API_URL}/tenant/settings`, {
      method: "PATCH",
      headers: {
        ...headers,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
      body: isFormData ? data : JSON.stringify(data),
    });

    const result = await res.json();
    if (result.success) {
      revalidatePath("/dashboard/settings");
    }
    return result;
  } catch (error) {
    console.error("Error in updateSettingsAction:", error);
    return { success: false, error: "Error de conexión" };
  }
}
