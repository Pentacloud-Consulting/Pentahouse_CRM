import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Pentahouse CRM — Real Estate & Construction",
  description:
    "Professional CRM for real estate and construction management by Pentahouse Constructions. Track leads, projects, finances, and more.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Pentahouse CRM — Real Estate & Construction",
    description:
      "Professional CRM for real estate and construction management by Pentahouse Constructions. Track leads, projects, finances, and more.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pentahouse CRM",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pentahouse CRM — Real Estate & Construction",
    description:
      "Professional CRM for real estate and construction management by Pentahouse Constructions.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
