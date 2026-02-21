import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import ReduxProvider from "@/redux/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cafe Pilot",
  description: "Manage your cafe smoothly with Cafe Pilot",
  icons: {
    icon: "/cafepilot.png",
  },
};

import { Toaster } from "@/components/ui/toaster";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { BannerProvider } from "@/contexts/BannerContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BannerProvider>
          <AnnouncementBanner />
          {/* <ReduxProvider> {children}</ReduxProvider> */}
          {children}
        </BannerProvider>
        <Toaster />
      </body>
    </html>
  );
}
