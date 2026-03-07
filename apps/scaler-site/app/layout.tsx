import "./globals.css";

import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";

export const metadata = {
  title: "Scaler Docs",
  description: "Pan/zoom/scroll transformation library for any JS runtime."
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
