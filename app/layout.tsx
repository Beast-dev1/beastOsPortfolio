import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Windows 11 Portfolio OS",
  description: "A Windows 11-inspired portfolio operating system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="win11-cursor">
      <body className="min-h-screen font-segoe antialiased bg-windows11-wallpaper bg-cover bg-center">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

