import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskpaz - AI-Powered Productivity",
  description: "Boost your productivity with AI-powered task management.",
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeAccentProvider } from "@/components/providers/ThemeAccentProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAccentProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-right" expand={false} richColors />
          </ThemeAccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
