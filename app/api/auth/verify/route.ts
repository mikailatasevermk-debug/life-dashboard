import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }
    
    // Verify the token and get the email
    const email = await verifyToken(token)
    
    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }
    
    // Update user's emailVerified status
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    })
    
    return NextResponse.json({
      message: "Email verified successfully!",
      email: user.email
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}