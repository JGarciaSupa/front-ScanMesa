import getTenantSlugServer from "@/utils/getTenantSlugServer";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

async function getSettings(tenantSlug: string) {  
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/tenant/settings`, {
    headers: { "x-schema-tenant": tenantSlug },
    // Revalidación corta o inmediata, según necesidades
    next: { revalidate: 60 }
  });
  
  if (!response.ok) throw new Error("Error fetching tenant settings");
  return response.json();
}

export default async function LoginPage() {
  const subDomain = await getTenantSlugServer();
  
  const tenantData = await getSettings(subDomain).catch((e) => {
    console.error("No se pudo obtener el tenant", e);
    // Podría redirigirse a un layout genérico de error o la web corporativa
    redirect("https://lobitoconsulting.lobitoconsulting.store/");
  });

  if (!tenantData || !tenantData.data) {
    redirect("https://lobitoconsulting.lobitoconsulting.store/");
  }

  const tenant = tenantData.data;

  // Pasar variables minimalistas para la UI
  const branding = {
    name: tenant.name,
    logoUrl: tenant.logoUrl,
    bannerUrl: tenant.bannerUrl
  };

  return <LoginForm tenant={branding} />;
}
