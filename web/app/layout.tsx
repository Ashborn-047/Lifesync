import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/animations.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LifeSync — Personality OS",
  description:
    "AI-powered personality assessment & life engine. Discover your Big Five traits, get personalized insights, and optimize your life.",
  keywords: [
    "personality",
    "assessment",
    "Big Five",
    "AI",
    "life optimization",
    "MBTI",
    "psychology",
  ],
  authors: [{ name: "LifeSync" }],
  openGraph: {
    title: "LifeSync — Personality OS",
    description: "AI-powered personality assessment & life engine",
    type: "website",
    siteName: "LifeSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeSync — Personality OS",
    description: "AI-powered personality assessment & life engine",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">

      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 pointer-events-none" />
              <div className="relative z-10">{children}</div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
