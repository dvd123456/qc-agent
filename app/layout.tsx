import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)", color: "#3b82f6" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL("https://qc-agent-ai.vercel.app"),
  title: {
    default: "QC Agent AI - Intelligent Quality Control Management",
    template: "%s | QC Agent AI",
  },
  description:
    "Advanced AI-powered quality control management platform. Streamline your QC processes, analyze files, track project progress, and ensure quality standards with intelligent automation.",
  keywords: [
    "quality control",
    "AI assistant",
    "project management",
    "file analysis",
    "QC automation",
    "quality assurance",
    "intelligent QC",
    "project tracking",
    "quality management system",
    "AI-powered QC",
  ],
  authors: [{ name: "QC Agent AI Team" }],
  creator: "QC Agent AI",
  publisher: "QC Agent AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qc-agent-ai.vercel.app",
    siteName: "QC Agent AI",
    title: "QC Agent AI - Intelligent Quality Control Management",
    description:
      "Advanced AI-powered quality control management platform. Streamline your QC processes with intelligent automation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QC Agent AI - Intelligent Quality Control Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QC Agent AI - Intelligent Quality Control Management",
    description:
      "Advanced AI-powered quality control management platform. Streamline your QC processes with intelligent automation.",
    images: ["/og-image.png"],
    creator: "@qcagentai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://qc-agent-ai.vercel.app",
  },
  category: "technology",
    generator: 'v0.dev'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QC Agent AI",
  description:
    "Advanced AI-powered quality control management platform for streamlining QC processes and ensuring quality standards.",
  url: "https://qc-agent-ai.vercel.app",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "QC Agent AI Team",
  },
  featureList: [
    "AI-powered quality control analysis",
    "Project management and tracking",
    "File upload and analysis",
    "Real-time chat assistance",
    "Progress monitoring",
    "Quality reporting",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
