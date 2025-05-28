import type { Metadata } from "next"
import { ChatPageClient } from "@/components/chat-page-client"

interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { id } = params

  // In a real app, you'd fetch the project details here
  const projectName = `Project ${id}`

  return {
    title: `${projectName} - AI Chat Assistant`,
    description: `Interact with AI assistant for ${projectName}. Get insights, ask questions, and manage your quality control project with intelligent automation.`,
    openGraph: {
      title: `${projectName} - QC Agent AI Chat`,
      description: `AI-powered chat assistant for quality control project management and analysis.`,
      url: `https://qc-agent-ai.vercel.app/projects/${id}/chat`,
    },
    twitter: {
      title: `${projectName} - QC Agent AI Chat`,
      description: `AI-powered chat assistant for quality control project management.`,
    },
    alternates: {
      canonical: `https://qc-agent-ai.vercel.app/projects/${id}/chat`,
    },
  }
}

const generateChatJsonLd = (projectId: string, projectName: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `${projectName} - AI Chat Assistant`,
  description: "AI-powered chat interface for quality control project management and analysis.",
  url: `https://qc-agent-ai.vercel.app/projects/${projectId}/chat`,
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
      {
        "@type": "ListItem",
        position: 3,
        name: projectName,
        item: `https://qc-agent-ai.vercel.app/projects/${projectId}/chat`,
      },
    ],
  },
})

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = params
  const projectName = `Project ${id}`
  const chatJsonLd = generateChatJsonLd(id, projectName)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(chatJsonLd) }} />
      <main>
        <ChatPageClient projectId={id} />
      </main>
    </>
  )
}
