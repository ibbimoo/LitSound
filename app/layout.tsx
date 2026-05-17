import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LitSound",
  description: "Turn music descriptions from books into playable AI-generated tracks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
