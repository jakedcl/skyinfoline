import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skyinfoline — NYC Skyline",
  description:
    "A stylized, interactive Manhattan skyline—Jersey City or Brooklyn Bridge, scrub through history.",
};

const uiFontStyle = {
  ["--font-ui"]: '"Helvetica Neue", Helvetica, Arial, sans-serif',
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="flex min-h-full flex-col font-[family-name:var(--font-ui)]"
        style={uiFontStyle}
      >
        {children}
      </body>
    </html>
  );
}
