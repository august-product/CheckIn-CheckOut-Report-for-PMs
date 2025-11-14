import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Check-In / Check-Out Report",
  description: "Generate property management reservation reports"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f0e6] text-slate-900">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-[#304037]">
            Copyright 2026, August Ltd.
          </footer>
        </div>
      </body>
    </html>
  );
}
