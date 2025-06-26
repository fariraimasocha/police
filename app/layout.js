import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/session-provider";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OClear",
  description: "Police Clearance Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Providers>
        <QueryProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
            <Toaster />
          </body>
        </QueryProvider>
      </Providers>
    </html>
  );
}
