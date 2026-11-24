import type { Metadata } from "next";
import Link from "next/link";
import { Map, Search } from "lucide-react";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource-variable/dm-sans";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SkyInfoLine | New York City Building Atlas", template: "%s | SkyInfoLine" },
  description: "Find New York City buildings by name, address or map, and explore the architecture and history behind them.",
};
export const viewport = { themeColor: "#f8f6f0" };

function Wordmark() {
  return (
    <Link className="wordmark" href="/">
      <span className="wordmark-icon" aria-hidden="true"><i /><i /><i /></span>
      <span>SkyInfoLine</span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <div className="frame header-inner">
            <Wordmark />
            <nav aria-label="Main navigation">
              <Link href="/explore"><Search size={16} aria-hidden="true" /> Explore</Link>
              <Link href="/explore?view=map"><Map size={17} aria-hidden="true" /> Map</Link>
            </nav>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="frame footer-inner">
            <Wordmark />
            <p>An independent architectural atlas of New York City.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
