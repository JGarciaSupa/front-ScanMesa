import getTenantSlugServer from "@/utils/getTenantSlugServer";
import ClientMenu from "@/components/qr/ClientMenu";

async function getSettings(tenantSlug: string): Promise<{
  success: boolean;
  data: {
    info: {
      id: number;
      name: string;
      logoUrl: string | null;
      bannerUrl: string | null;
      currency: string | null;
      latitude: number | null;
      longitude: number | null;
      allowedRadiusMeters: number | null;
      radiusEnabled: boolean;
    };
    categories: {
      id: number;
      name: string;
    }[];
    products: any[];
  };
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/settings/client`,
    {
      headers: { "x-schema-tenant": tenantSlug },
    },
  );
  if (!response.ok) throw new Error("Error fetching settings");
  return response.json();
}

export default async function PageQRTable({
  params,
}: {
  params: Promise<{ tableId: string }> | { tableId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const tableId = resolvedParams.tableId || "7";

  const subDomain = await getTenantSlugServer();
  const data = await getSettings(subDomain);

  return <ClientMenu tableId={tableId} tenantData={data.data} />;
}
