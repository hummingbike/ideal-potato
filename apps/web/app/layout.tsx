import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나혼자만 인테리어",
  description: "내 방을 그리드로 나누고 가구를 재배치해보는 개인용 인테리어 시뮬레이터",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
