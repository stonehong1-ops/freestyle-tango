import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "프리스타일탱고 | FreestyleTango",
  description: "합정 & 덕은(상암) 프리스타일탱고 - 밀롱가, 클래스, 스테이 예약",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "프리스타일탱고",
    startupImage: "/images/logo.png"
  },
  icons: {
    apple: "/images/logo.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};


import FCMInitializer from "@/components/common/FCMInitializer";
import ChatNotification from "@/components/chat/ChatNotification";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <FCMInitializer />
            <ChatNotification />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
