import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import "./globals.css";
import { QueryClientProviderWrapper } from "@/app/QueryClientProvider";
import { Toaster } from "sonner";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConvexClientProvider>
          <QueryClientProviderWrapper>
            {children}
            <Toaster position="top-center" richColors />
          </QueryClientProviderWrapper>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
