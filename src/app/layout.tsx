import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanji Test App",
  description: "Learn and test your kanji knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSerifJP.className}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
