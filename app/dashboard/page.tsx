import type { Metadata } from "next"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard - Your QC Projects",
  description:
    "Manage your quality control projects, track progress, and access AI-powered analysis tools. View all your QC projects in one centralized dashboard.",
  openGraph: {
    title: "Dashboard - QC Agent AI",
    description: "Manage your quality control projects and track progress with AI-powered tools.",
    url: "https://qc-agent-ai.vercel.app/dashboard",
  },
  twitter: {
    title: "Dashboard - QC Agent AI",
    description: "Manage your quality control projects and track progress with AI-powered tools.",
  },
  alternates: {
    canonical: "https://qc-agent-ai.vercel.app/dashboard",
  },
}

const dashboardJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Dashboard - QC Agent AI",
  description: "Project management dashboard for quality control projects with AI-powered analysis.",
  url: "https://qc-agent-ai.vercel.app/dashboard",
  isPartOf: {
    "@type": "WebSite",
    name: "QC Agent AI",
    url: "https://qc-agent-ai.vercel.app",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://qc-agent-ai.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dashboard",
        item: "https://qc-agent-ai.vercel.app/dashboard",
      },
    ],
  },
}

export default function Dashboard() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dashboardJsonLd) }} />
      <main>
        <DashboardClient />
      </main>
    </>
  )
}
