import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { PrelineLoader } from "@/components/preline/preline-loader";

export const metadata: Metadata = {
  title: "App Điều hành Tour",
  description: "Back-office điều hành tour theo PRD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <PrelineLoader />
      </body>
    </html>
  );
}
