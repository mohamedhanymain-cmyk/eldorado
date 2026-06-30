import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eldorado ERP — Digital Goods Management",
  description:
    "Production-grade ERP system for managing digital account inventory, suppliers, sales, and marketplace integrations.",
  keywords: ["ERP", "inventory", "digital goods", "Eldorado"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen animated-gradient custom-scrollbar">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
