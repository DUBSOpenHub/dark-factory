import type { Metadata } from "next";
import "./globals.css";

const SITE = "https://dubsopenhub.github.io/dark-factory";
const DESCRIPTION =
  "Dark Factory is a GitHub Copilot CLI skill that turns a short free-text goal into a production-grade pull request. Eight specialist agents drawn from different model families, sealed-envelope testing, and a checkpoint-gated pipeline.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Dark Factory 🏭 — Lights Out Builds",
  description: DESCRIPTION,
  keywords: [
    "GitHub Copilot CLI",
    "Copilot skill",
    "agentic build system",
    "sealed-envelope testing",
    "shadow score",
    "adversarial independence",
    "AI code review",
  ],
  authors: [{ name: "DUBSOpenHub", url: "https://github.com/DUBSOpenHub" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Dark Factory",
    title: "Dark Factory 🏭 — Lights Out Builds",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dark Factory 🏭 — Lights Out Builds",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
