import type { NextConfig } from "next";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "lobitoconsulting.test";

const nextConfig: NextConfig = {
  // Permite cargar imágenes desde cualquier subdominio del dominio base
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `**.${BASE_DOMAIN}`,
      },
      {
        protocol: "http",
        hostname: `**.${BASE_DOMAIN}`,
      },
      // También permitir imágenes externas comunes (Unsplash, S3, etc.)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
