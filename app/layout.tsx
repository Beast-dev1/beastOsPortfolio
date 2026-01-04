import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-segoe antialiased">
        {children}
      </body>
    </html>
  );
}

