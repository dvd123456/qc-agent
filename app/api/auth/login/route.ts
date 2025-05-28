import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication logic - accept any email/password for demo
    if (email && password) {
      const mockUser = {
        id: "user_123",
        email: email,
        name: "John Doe",
        role: "admin",
        token: "mock_jwt_token_" + Date.now(),
      }

      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          data: {
            user: mockUser,
            token: mockUser.token,
          },
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Login API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
