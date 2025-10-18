import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elevate Auth",
  description: "Authentication platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans bg-app">
        {children}
      </body>
    </html>
  );
}