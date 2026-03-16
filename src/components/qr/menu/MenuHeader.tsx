"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Share2, Receipt } from "lucide-react";
import Link from "next/link";
import ButtonWaiterdCalled from "@/components/qr/ButtonWaiterdCalled";

interface MenuHeaderProps {
  bannerUrl: string | null;
  logoUrl: string | null;
  name: string;
  tableId: string;
  tableName: string;
  sessionCode: string;
  handleShare: () => void;
  internalTableId: number | null;
}

export default function MenuHeader({
  bannerUrl,
  logoUrl,
  name,
  tableId,
  tableName,
  sessionCode,
  handleShare,
  internalTableId
}: MenuHeaderProps) {
  return (
    <header className="relative w-full h-56 md:h-64 lg:h-80 overflow-hidden bg-black/80">
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt="Restaurant cover"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.dataset.retried) {
              target.dataset.retried = "true";
              setTimeout(() => {
                target.src = bannerUrl + "?retry=" + Date.now();
              }, 1000);
            }
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)" }}
      />
      <div className="absolute top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-10">
        <Badge variant="secondary" className="bg-white/95 text-black border-0 font-bold whitespace-nowrap text-[10px] md:text-sm py-1 px-2">
          📍 {tableName || `Mesa ${tableId}`} • {sessionCode}
        </Badge>
        
        <div className="flex items-center gap-1.5 ml-auto">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-white/95 hover:bg-white text-black h-8 w-8 rounded-full shrink-0 shadow-sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Link href={`/qr/${tableId}/checkout`}>
            <Button variant="secondary" size="sm" className="bg-white/95 hover:bg-white text-black border-0 font-bold h-8 px-3 rounded-full shadow-sm text-xs">
              <Receipt className="w-3.5 h-3.5 mr-1" />
              Cuenta
            </Button>
          </Link>
          <ButtonWaiterdCalled tableId={internalTableId || parseInt(tableId)} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4 z-10">
        <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-white/20 shadow-xl shrink-0 bg-white">
          {logoUrl ? (
            <AvatarImage 
              src={logoUrl} 
              alt="logo" 
              className="object-cover" 
              onLoadingStatusChange={(status) => {
                if (status === 'error') {
                   // Avatar de radix maneja fallback internamente si detecta error
                }
              }}
            />
          ) : (
            <AvatarFallback className="text-2xl font-bold bg-zinc-900 text-white">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="pb-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
            {name}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 opacity-80">
            <span className="text-white text-xs font-medium flex items-center gap-1 bg-black/30 py-0.5 rounded-full backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>Abierto · Cierra a las 23:30</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
