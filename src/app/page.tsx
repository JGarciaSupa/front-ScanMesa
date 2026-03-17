import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Componente de Servidor (Server Component)
 * Se ejecuta en el servidor antes de enviar el HTML al cliente.
 */
export default async function HomePage() {
  const headerList = await headers();
  const host = headerList.get("host") || "";

  // Lógica de detección de Tenant en el Servidor
  const subDomain = host.split(".")[0] || "no_tenant";

  // Opcional: Solo redirigir si no es localhost o www
  const isLocal = host.includes("localhost");
  const isMain = subDomain === "www" || subDomain === "no_tenant";

  // Debug en la consola de la TERMINAL (no del navegador)
  console.log("------- SERVER-SIDE REDIRECT -------");
  console.log("Host detectado:", host);
  console.log("Subdominio:", subDomain);

  // Redirección inmediata (Status 307)
  // Esto detiene la ejecución aquí y manda al usuario a /qr
  redirect("/qr");

  // Este retorno nunca se alcanza, pero se deja por estructura
  return null;
}
