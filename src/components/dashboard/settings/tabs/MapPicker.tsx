"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issue in Next.js
// Fix for Leaflet default icon issue in Next.js
// We do this check to avoid re-initializing during HMR
if (typeof window !== "undefined") {
  const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
  const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
  const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

  const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = DefaultIcon;
}

interface MapPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Sync map view when lat/lng changes from outside (e.g. GPS button)
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return (
    <Marker
      position={[lat, lng]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onChange(position.lat, position.lng);
        },
      }}
    />
  );
}

export default function MapPicker({
  lat,
  lng,
  radius,
  onChange,
}: MapPickerProps) {
  // Ensure we have valid coordinates, fallback to a default if 0
  const centerLat = lat !== 0 ? lat : -12.04318;
  const centerLng = lng !== 0 ? lng : -77.02824;

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border shadow-inner relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={17}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={centerLat} lng={centerLng} onChange={onChange} />
        <Circle
          center={[centerLat, centerLng]}
          radius={radius}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
          }}
        />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-400 bg-white/90 px-2 py-1 rounded text-[10px] text-muted-foreground border shadow-sm">
        Haz clic o arrastra el marcador para ubicar tu local
      </div>
    </div>
  );
}
