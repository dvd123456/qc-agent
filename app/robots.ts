import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://qc-agent-ai.vercel.app"

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/dashboard"],
      disallow: ["/api/", "/projects/*/upload", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
