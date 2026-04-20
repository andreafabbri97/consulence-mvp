import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Advisor MVP",
  description: "Consulenza potenziata da AI per KPI e azioni",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
