import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ButtonWaiterdCalled from "@/components/qr/ButtonWaiterdCalled";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getTenantSlugServer from "@/utils/getTenantSlugServer";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import CategoryFilter from "@/components/qr/CategoryFilter";

async function getSettings(tenantSlug: string): Promise<{
  success: boolean,
  data: {
    info: {
      id: number
      name: string
      logoUrl: string | null
      bannerUrl: string | null
      currency: string | null
      defaultTaxRate: string | null
      latitude: number | null
      longitude: number | null
      allowedRadiusMeters: number | null
    }
    categories: {
      id: number,
      name: string
    }[]
    products: any[]
  }
}> {  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/settings/client`, {
    headers: { "x-schema-tenant": tenantSlug },
  });
  if (!response.ok) throw new Error("Errror");
  return response.json()
}

export default async function PageQRTable() {
  
  const subDomain = await getTenantSlugServer();
  const data = await getSettings(subDomain).catch(() => {
    redirect("https://lobitoconsulting.lobitoconsulting.store/");
  });

  console.log("data: ", data);

  const tableData = { id: "4", name: "Mesa 4" };

  return (
    <div className="w-full max-w-480 mx-auto min-h-screen">
      <header className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
        <img
          src={data.data.info.bannerUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=90"}
          alt="Restaurant cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.78) 100%)" }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <Badge>
            <MapPin /> { tableData.name }
          </Badge>
          <ButtonWaiterdCalled />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end gap-3 z-10">
          <Avatar className="w-14 h-14 md:w-16 md:h-16 border-2 border-white/40 shadow-xl shrink-0">
            {data.data.info.logoUrl
              ? <AvatarImage src={data.data.info.logoUrl} alt="logo" />
              : <AvatarFallback className="text-xl">
                  {data.data.info.name[0].toUpperCase()}
                </AvatarFallback>
            }
          </Avatar>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
              {data.data.info.name}
            </h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-white/70 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="leading-0">Abierto · Cierra a las 23:30</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto w-full">
            <CategoryFilter 
              categories={data.data.categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
