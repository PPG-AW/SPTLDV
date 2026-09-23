import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LINIERKu — Media Pembelajaran SPtLDV",
  description: "Media pembelajaran interaktif Sistem Pertidaksamaan Linear Dua Variabel untuk SMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 antialiased">
        {children}
      </body>
    </html>
  );
}
