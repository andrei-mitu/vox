import type { Metadata } from "next";
import '@radix-ui/themes/styles.css';
import { Inter, Geist_Mono } from "next/font/google";
import ThemeProvider from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { nexaText } from '@/lib/fonts';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vox",
  description: "TMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nexaText.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
