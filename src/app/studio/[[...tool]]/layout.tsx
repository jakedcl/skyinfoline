import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Skyinfoline Studio",
  description: "Edit Manhattan skyline buildings",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Studio needs a full viewport; theme-color helps mobile chrome
  themeColor: "#101112",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden bg-[#101112]">
      {children}
    </div>
  );
}
