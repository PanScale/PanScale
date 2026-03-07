import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Scaler Playground",
  description: "Interactive demo for @scaler/react pan/zoom/scroll."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
