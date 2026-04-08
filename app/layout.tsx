import type { Metadata } from "next";
import '@radix-ui/themes/styles.css';
import { Inter, Geist_Mono } from "next/font/google";
import ThemeProvider from '@/components/ThemeProvider';
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
  icons: {
    icon: [
      // "Dark Main" = light-coloured text/graphic — legible on dark browser chrome
      { url: '/images/logo/VOX Dark Main gradient.svg', media: '(prefers-color-scheme: dark)' },
      // "Dark 2" = dark-coloured text/graphic — legible on light browser chrome
      { url: '/images/logo/VOX Dark 2 gradient.svg', media: '(prefers-color-scheme: light)' },
    ],
  },
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
