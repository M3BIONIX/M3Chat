import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {ConvexClientProvider} from "@/app/ConvexClientProvider";
import "./globals.css";
import {QueryClient} from "@tanstack/query-core";
import {QueryClientProvider} from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M3Chat",
  description: "An Interactive Chat App to use Mistral Models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const queryClient = new QueryClient()

    return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ConvexClientProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
      </ConvexClientProvider>
      </body>
    </html>
  );
}
