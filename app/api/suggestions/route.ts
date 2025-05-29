import { type NextRequest, NextResponse } from "next/server"

// Comprehensive suggestion database organized by categories
const SUGGESTION_DATABASE = {
  issues: [
    "What specific bugs have been identified in the system?",
    "How critical are these issues for the release timeline?",
    "What's the root cause of this problem?",
    "How can we prevent similar issues in the future?",
    "Which team member should handle this issue?",
    "What's the estimated time to fix this problem?",
    "Are there any workarounds available?",
    "How does this issue impact other components?",
    "What testing was done before this issue occurred?",
    "Should we escalate this to senior management?",
    "What documentation exists for this problem?",
    "How many users are affected by this issue?",
    "What's the business impact of this problem?",
    "Are there similar issues in other projects?",
    "What tools can help us debug this faster?",
  ],
  progress: [
    "Are we on track to meet the project deadline?",
    "What milestones have been completed so far?",
    "Which tasks are currently blocking progress?",
    "How can we accelerate the development timeline?",
    "What resources do we need to stay on schedule?",
    "Should we adjust the project scope or timeline?",
    "What's the current completion percentage?",
    "Which deliverables are at risk of delay?",
    "How often should we review progress updates?",
    "What metrics are we using to track progress?",
    "Are there any dependencies causing delays?",
    "Should we bring in additional team members?",
    "What's the critical path for project completion?",
    "How do we communicate progress to stakeholders?",
    "What contingency plans do we have for delays?",
  ],
  files: [
    "What files still need to be uploaded to the system?",
    "How should we organize the project documentation?",
    "Which file formats are supported for upload?",
    "What's the maximum file size limit?",
    "How do we ensure file version control?",
    "Should we implement file backup procedures?",
    "What access permissions are needed for these files?",
    "How do we validate uploaded file integrity?",
    "What naming conventions should we follow?",
    "Where should sensitive files be stored?",
    "How do we track file modification history?",
    "What metadata should be captured for each file?",
    "Should we compress files before uploading?",
    "How do we handle duplicate file uploads?",
    "What's the retention policy for project files?",
  ],
  quality: [
    "What quality metrics should we focus on?",
    "How can we improve our testing coverage?",
    "What automated testing tools should we implement?",
    "How do we ensure code quality standards?",
    "What peer review process should we follow?",
    "How often should we conduct quality audits?",
    "What performance benchmarks need to be met?",
    "How do we measure user satisfaction?",
    "What security testing is required?",
    "Should we implement continuous integration?",
    "How do we handle quality assurance feedback?",
    "What documentation standards should we maintain?",
    "How do we ensure accessibility compliance?",
    "What load testing scenarios should we run?",
    "How do we validate business requirements?",
  ],
  team: [
    "Who should be assigned to this task?",
    "How can we improve team communication?",
    "What skills does the team need to develop?",
    "Should we schedule a team meeting to discuss this?",
    "How do we distribute workload evenly?",
    "What collaboration tools should we use?",
    "How do we handle team member availability?",
    "Should we bring in external consultants?",
    "How do we manage remote team members?",
    "What training opportunities are available?",
    "How do we resolve team conflicts?",
    "What's the team's capacity for new work?",
    "How do we recognize team achievements?",
    "Should we reorganize team responsibilities?",
    "How do we maintain team morale?",
  ],
  planning: [
    "What should be our next priority?",
    "How do we align this with business objectives?",
    "What resources are needed for implementation?",
    "Should we create a detailed project plan?",
    "How do we manage project risks?",
    "What's our strategy for stakeholder engagement?",
    "How do we prioritize feature requests?",
    "What's the long-term vision for this project?",
    "Should we conduct a feasibility study?",
    "How do we measure project success?",
    "What contingency plans should we prepare?",
    "How do we handle scope changes?",
    "What's our budget allocation strategy?",
    "Should we phase the implementation?",
    "How do we ensure regulatory compliance?",
  ],
  performance: [
    "How can we optimize system performance?",
    "What bottlenecks are affecting speed?",
    "Should we implement caching strategies?",
    "How do we monitor performance metrics?",
    "What hardware upgrades might be needed?",
    "How can we reduce response times?",
    "Should we optimize database queries?",
    "What load balancing strategies should we use?",
    "How do we handle peak traffic periods?",
    "What performance testing tools should we use?",
    "How can we improve user experience?",
    "Should we implement CDN solutions?",
    "What's causing memory usage spikes?",
    "How do we optimize mobile performance?",
    "What scalability improvements are needed?",
  ],
  general: [
    "What additional information do you need?",
    "How can I help you with this project?",
    "Should we schedule a follow-up discussion?",
    "What are the main challenges you're facing?",
    "How does this relate to other project components?",
    "What's the expected outcome for this task?",
    "Should we document this decision?",
    "How do we communicate this to stakeholders?",
    "What are the potential risks involved?",
    "Should we seek additional approvals?",
    "How does this impact the project timeline?",
    "What best practices should we follow?",
    "Should we consult with subject matter experts?",
    "How do we ensure this meets requirements?",
    "What lessons can we learn from this?",
  ],
}

// Keywords mapped to categories for intelligent matching
const CATEGORY_KEYWORDS = {
  issues: ["bug", "error", "problem", "issue", "fail", "broken", "crash", "exception", "fault", "defect"],
  progress: ["progress", "timeline", "deadline", "schedule", "milestone", "completion", "track", "status", "update"],
  files: ["file", "upload", "document", "attachment", "download", "storage", "folder", "directory", "backup"],
  quality: ["test", "quality", "review", "check", "validate", "audit", "standard", "compliance", "assurance"],
  team: ["team", "member", "assign", "collaborate", "communication", "meeting", "workload", "resource", "staff"],
  planning: ["plan", "strategy", "goal", "objective", "priority", "scope", "requirement", "vision", "roadmap"],
  performance: ["performance", "speed", "optimize", "slow", "fast", "bottleneck", "efficiency", "scalability"],
  general: ["help", "support", "question", "how", "what", "when", "where", "why", "project", "system"],
}

function extractKeywords(message: string): string[] {
  const words = message.toLowerCase().split(/\s+/)
  const keywords: string[] = []

  for (const word of words) {
    for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (categoryKeywords.some((keyword) => word.includes(keyword))) {
        keywords.push(word)
      }
    }
  }

  return [...new Set(keywords)] // Remove duplicates
}

function determineCategory(message: string): string {
  const keywords = extractKeywords(message)
  const categoryScores: { [key: string]: number } = {}

  // Initialize scores
  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    categoryScores[category] = 0
  }

  // Score each category based on keyword matches
  for (const keyword of keywords) {
    for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (categoryKeywords.some((ck) => keyword.includes(ck))) {
        categoryScores[category]++
      }
    }
  }

  // Find category with highest score
  let bestCategory = "general"
  let highestScore = 0

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > highestScore) {
      highestScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

function generateSuggestions(category: string, count = 2): string[] {
  const suggestions = SUGGESTION_DATABASE[category as keyof typeof SUGGESTION_DATABASE] || SUGGESTION_DATABASE.general

  // Shuffle and select random suggestions
  const shuffled = [...suggestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, projectId } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Message is required and must be a string" }, { status: 400 })
    }

    // Analyze message and determine category
    const keywords = extractKeywords(message)
    const category = determineCategory(message)
    const suggestions = generateSuggestions(category, 2)

    return NextResponse.json({
      success: true,
      suggestions,
      category,
      keywords,
      message: `Generated ${suggestions.length} suggestions based on '${category}' category`,
    })
  } catch (error) {
    console.error("Suggestions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get("category")

    if (category) {
      // Return suggestions for specific category
      const suggestions = SUGGESTION_DATABASE[category as keyof typeof SUGGESTION_DATABASE]
      if (!suggestions) {
        return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        category,
        suggestions,
        total: suggestions.length,
      })
    }

    // Return overview of all categories
    const overview = Object.keys(SUGGESTION_DATABASE).map((cat) => ({
      category: cat,
      count: SUGGESTION_DATABASE[cat as keyof typeof SUGGESTION_DATABASE].length,
      keywords: CATEGORY_KEYWORDS[cat as keyof typeof CATEGORY_KEYWORDS],
    }))

    return NextResponse.json({
      success: true,
      categories: overview,
      totalSuggestions: Object.values(SUGGESTION_DATABASE).reduce((sum, arr) => sum + arr.length, 0),
    })
  } catch (error) {
    console.error("Suggestions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
