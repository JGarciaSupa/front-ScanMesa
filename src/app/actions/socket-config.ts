"use server";

import getTenantSlugServer from "@/utils/getTenantSlugServer";
import { cookies } from "next/headers";

export async function getSocketConfigAction() {
  const slug = await getTenantSlugServer();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  return {
    slug,
    token,
    url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  };
}
