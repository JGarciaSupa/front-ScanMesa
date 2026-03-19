import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthSync from "@/components/auth/AuthSync";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qvadro",
  description: "POS & KDS para Restaurantes",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sistema Autogestión",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${roboto.variable} antialiased`}
      >
        <AuthSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
