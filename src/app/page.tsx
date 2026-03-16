"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Lógica para ver el tenant en el cliente
    const host = window.location.hostname;
    const subDomain = host.split('.')[0] || "No tenant detected";
    const tenantSlug = subDomain.replace('-', '_');
    
    console.log("------- DEBUG TENANT (CLIENTE) -------");
    console.log("Host:", host);
    console.log("Tenant Slug:", tenantSlug);

    const fetchDebugInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/tenant/debug/info`, {
          headers: {
            'x-schema-tenant': tenantSlug
          }
        });
        const data = await response.json();
        console.log("------- DATA DESDE DB (BACKEND) -------");
        console.dir(data, { depth: null });
        console.log("---------------------------------------");
      } catch (error) {
        console.error("Error al obtener info de DB:", error);
      }
    };

    if (subDomain && subDomain !== "No tenant detected" && subDomain !== "localhost") {
      fetchDebugInfo();
    } else {
      console.log("No se detectó un subdominio válido para consultar la DB.");
    }
    
    console.log("--------------------------------------");
  }, []);


  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Bienvenido al Sistema de Autogestión</h1>
      <p className="text-muted-foreground mb-8">Aqui ira la landing page principal.</p>
      <div className="bg-muted p-4 rounded-lg shadow-sm">
        <p className="text-sm font-mono">Revisa la consola del navegador para ver el tenant detectado.</p>
      </div>
    </div>
  );
}

