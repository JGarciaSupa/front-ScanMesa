import { headers } from "next/headers";

export default async function getTenantSlugServer() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const subDomain = host.split('.')[0] ?? "";
  return subDomain.replace('-', '_');
}