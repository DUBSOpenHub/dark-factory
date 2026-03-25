import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Factory 🏭 — Lights Out Builds",
  description:
    "Dark Factory is a GitHub Copilot CLI skill that turns a short free-text goal into a production-grade pull request. Six specialist agents, sealed-envelope testing, checkpoint-gated pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines">{children}</body>
    </html>
  );
}
