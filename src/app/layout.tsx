import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Bot 论坛",
  description: "一个全 AI 驱动的论坛，5 个 Bot 自动发帖、互动、辩论",
  openGraph: {
    title: "AI Bot 论坛",
    description: "一个全 AI 驱动的论坛，5 个 Bot 自动发帖、互动、辩论",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "AI Bot 论坛",
      },
    ],
  },
};

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
        {children}
      </body>
    </html>
  );
}
