import { type NextRequest, NextResponse } from "next/server"

// Comprehensive suggestion database organized by categories
const SUGGESTION_DATABASE = {
  issues: [
    "What specific bugs have been identified?",
    "How critical are these issues for the release?",
    "Which team member should handle this problem?",
    "What's the root cause of this issue?",
    "How can we prevent similar problems in the future?",
    "What's the timeline for fixing these bugs?",
    "Are there any workarounds available?",
    "How does this affect the overall project timeline?",
    "What testing was done before this issue was found?",
    "Should we escalate this to management?",
    "What resources do we need to resolve this?",
    "How many users are affected by this issue?",
    "Is this a blocking issue for deployment?",
    "What's the severity level of this problem?",
    "Can we reproduce this issue consistently?",
  ],
  progress: [
    "Are we on track to meet the deadline?",
    "What's blocking our progress right now?",
    "How much work is left to complete?",
    "Should we adjust the project timeline?",
    "What milestones have we achieved so far?",
    "Are there any dependencies causing delays?",
    "How can we accelerate the development process?",
    "What's the current completion percentage?",
    "Are we meeting our sprint goals?",
    "Should we add more resources to the project?",
    "What tasks are behind schedule?",
    "How does our progress compare to the plan?",
    "Are there any risks to the timeline?",
    "What's the estimated delivery date?",
    "Should we reprioritize some features?",
  ],
  files: [
    "What files still need to be uploaded?",
    "Are all documents properly organized?",
    "Which files require review and approval?",
    "How should we structure the file system?",
    "Are there any missing documentation files?",
    "What's the file naming convention we should use?",
    "How can we improve file accessibility?",
    "Are all files backed up properly?",
    "Which files need version control?",
    "How should we handle file permissions?",
    "What file formats are we standardizing on?",
    "Are there any duplicate files to clean up?",
    "How can we automate file management?",
    "What's the file size limit we should enforce?",
    "Should we implement a document approval workflow?",
  ],
  quality: [
    "What quality metrics should we track?",
    "How can we improve our testing process?",
    "Are we meeting quality standards?",
    "What test cases need to be updated?",
    "How effective is our current QA process?",
    "Should we add more automated tests?",
    "What's our current defect rate?",
    "How can we prevent quality issues?",
    "Are we following best practices?",
    "What quality gates should we implement?",
    "How can we improve code review process?",
    "What testing tools should we adopt?",
    "Are we testing all critical paths?",
    "How can we measure quality improvements?",
    "Should we conduct more peer reviews?",
  ],
  team: [
    "Who should be responsible for this task?",
    "How can we improve team communication?",
    "Are team members properly trained?",
    "Should we schedule a team meeting?",
    "How can we better distribute workload?",
    "What skills does the team need to develop?",
    "Are there any team conflicts to address?",
    "How can we improve collaboration?",
    "Should we bring in additional expertise?",
    "What's the team's current capacity?",
    "How can we motivate the team better?",
    "Are team roles clearly defined?",
    "Should we reorganize team structure?",
    "How can we improve knowledge sharing?",
    "What team building activities should we consider?",
  ],
  planning: [
    "What should be our next priority?",
    "How should we plan the next sprint?",
    "What features should we focus on?",
    "Should we revise our project strategy?",
    "What are the key objectives for next quarter?",
    "How can we better align with business goals?",
    "What risks should we plan for?",
    "Should we adjust our resource allocation?",
    "What dependencies need to be managed?",
    "How can we improve our planning process?",
    "What contingency plans should we have?",
    "Should we break down tasks further?",
    "How can we better estimate effort?",
    "What assumptions need validation?",
    "Should we conduct a planning retrospective?",
  ],
  performance: [
    "How can we optimize system performance?",
    "What's causing the performance bottleneck?",
    "Should we implement caching strategies?",
    "How can we improve response times?",
    "What performance metrics should we monitor?",
    "Are there any scalability concerns?",
    "How can we reduce resource consumption?",
    "Should we conduct performance testing?",
    "What optimization techniques should we apply?",
    "How can we improve database performance?",
    "Are there any memory leaks to address?",
    "Should we upgrade our infrastructure?",
    "How can we optimize for mobile devices?",
    "What's the acceptable performance threshold?",
    "Should we implement performance monitoring?",
  ],
  general: [
    "What's the current project status?",
    "How can we improve overall efficiency?",
    "What lessons have we learned so far?",
    "Should we conduct a project review?",
    "What best practices should we adopt?",
    "How can we better manage stakeholder expectations?",
    "What tools could help us work more effectively?",
    "Should we update our project documentation?",
    "How can we improve our workflow?",
    "What training opportunities should we pursue?",
    "Should we benchmark against industry standards?",
    "How can we reduce project risks?",
    "What success criteria should we define?",
    "Should we celebrate recent achievements?",
    "How can we prepare for the next phase?",
  ],
}

// Keywords for each category
const CATEGORY_KEYWORDS = {
  issues: ["bug", "error", "problem", "issue", "fail", "broken", "crash", "exception", "defect", "fault"],
  progress: [
    "progress",
    "timeline",
    "deadline",
    "schedule",
    "milestone",
    "completion",
    "delay",
    "behind",
    "ahead",
    "track",
  ],
  files: ["file", "upload", "document", "attachment", "folder", "storage", "download", "backup", "version", "format"],
  quality: ["test", "quality", "review", "check", "validate", "verify", "standard", "criteria", "metric", "assessment"],
  team: [
    "team",
    "member",
    "communication",
    "collaborate",
    "meeting",
    "role",
    "responsibility",
    "skill",
    "training",
    "capacity",
  ],
  planning: [
    "plan",
    "strategy",
    "goal",
    "objective",
    "priority",
    "roadmap",
    "scope",
    "requirement",
    "feature",
    "sprint",
  ],
  performance: [
    "performance",
    "speed",
    "optimize",
    "slow",
    "fast",
    "bottleneck",
    "scalability",
    "efficiency",
    "resource",
    "memory",
  ],
  general: ["project", "status", "help", "how", "what", "when", "where", "why", "should", "can"],
}

// Function to extract keywords from user message
function extractKeywords(message: string): string[] {
  const words = message.toLowerCase().split(/\s+/)
  const keywords: string[] = []

  for (const word of words) {
    // Remove punctuation and get clean word
    const cleanWord = word.replace(/[^\w]/g, "")
    if (cleanWord.length > 2) {
      keywords.push(cleanWord)
    }
  }

  return keywords
}

// Function to determine category based on keywords
function determineCategory(keywords: string[]): string {
  const categoryScores: { [key: string]: number } = {}

  // Initialize scores
  for (const category of Object.keys(CATEGORY_KEYWORDS)) {
    categoryScores[category] = 0
  }

  // Calculate scores for each category
  for (const keyword of keywords) {
    for (const [category, categoryKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (categoryKeywords.some((ck) => keyword.includes(ck) || ck.includes(keyword))) {
        categoryScores[category]++
      }
    }
  }

  // Find category with highest score
  let bestCategory = "general"
  let bestScore = 0

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

// Function to select 2 random suggestions from a category
function selectSuggestions(category: string): string[] {
  const suggestions = SUGGESTION_DATABASE[category as keyof typeof SUGGESTION_DATABASE] || SUGGESTION_DATABASE.general

  // Shuffle and select 2 suggestions
  const shuffled = [...suggestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2)
}

// POST handler - Generate suggestions based on user message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, projectId } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, message: "Invalid message provided" }, { status: 400 })
    }

    // Extract keywords from user message
    const keywords = extractKeywords(message)

    // Determine the most relevant category
    const category = determineCategory(keywords)

    // Select 2 suggestions from the determined category
    const suggestions = selectSuggestions(category)

    // Log for debugging (remove in production)
    console.log(`Message: "${message}"`)
    console.log(`Keywords: [${keywords.join(", ")}]`)
    console.log(`Category: ${category}`)
    console.log(`Suggestions: [${suggestions.join(", ")}]`)

    return NextResponse.json({
      success: true,
      suggestions,
      category,
      keywords: keywords.slice(0, 5), // Return first 5 keywords for debugging
      message: `Generated ${suggestions.length} suggestions based on "${category}" category`,
    })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return NextResponse.json({ success: false, message: "Failed to generate suggestions" }, { status: 500 })
  }
}

// GET handler - Get available categories and sample suggestions
export async function GET() {
  try {
    const categories = Object.keys(SUGGESTION_DATABASE)
    const sampleSuggestions: { [key: string]: string[] } = {}

    // Get 3 sample suggestions from each category
    for (const category of categories) {
      const suggestions = SUGGESTION_DATABASE[category as keyof typeof SUGGESTION_DATABASE]
      sampleSuggestions[category] = suggestions.slice(0, 3)
    }

    return NextResponse.json({
      success: true,
      categories,
      sampleSuggestions,
      totalSuggestions: Object.values(SUGGESTION_DATABASE).reduce(
        (total, suggestions) => total + suggestions.length,
        0,
      ),
    })
  } catch (error) {
    console.error("Error fetching suggestion data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch suggestion data" }, { status: 500 })
  }
}
