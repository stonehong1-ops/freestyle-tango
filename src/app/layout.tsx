import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreestyleTango | 프리스타일 탱고",
  description: "Experience the ultimate freedom of Argentine Tango",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
