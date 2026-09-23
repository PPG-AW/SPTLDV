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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
