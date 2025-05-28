import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "QC Agent AI - Intelligent Quality Control Management",
  description:
    "Advanced AI-powered quality control management platform. Streamline your QC processes, analyze files, and ensure quality standards with intelligent automation.",
  openGraph: {
    title: "QC Agent AI - Intelligent Quality Control Management",
    description: "Advanced AI-powered quality control management platform with intelligent automation.",
    url: "https://qc-agent-ai.vercel.app",
  },
  twitter: {
    title: "QC Agent AI - Intelligent Quality Control Management",
    description: "Advanced AI-powered quality control management platform with intelligent automation.",
  },
  alternates: {
    canonical: "https://qc-agent-ai.vercel.app",
  },
}

const loginJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "QC Agent AI - Quality Control Management",
  description: "AI-powered quality control management platform for streamlining QC processes.",
  url: "https://qc-agent-ai.vercel.app",
  isPartOf: {
    "@type": "WebSite",
    name: "QC Agent AI",
    url: "https://qc-agent-ai.vercel.app",
  },
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(loginJsonLd) }} />
      <main className="flex min-h-screen flex-col items-center justify-center gradient-bg">
        <div className="w-full max-w-md space-y-8 p-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">QC Agent AI</h1>
            <p className="text-white/80 text-lg">Intelligent Quality Control Management</p>
          </header>
          <LoginForm />
        </div>
      </main>
    </>
  )
}
