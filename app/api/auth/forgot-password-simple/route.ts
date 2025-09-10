import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createVerificationToken } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        error: "No account found with this email address"
      }, { status: 404 })
    }

    // Create password reset token
    const token = await createVerificationToken(user.email)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    
    console.log(`🔑 Password reset for: ${user.email}`)
    console.log(`🔗 Reset link: ${resetUrl}`)

    // For now, return the link directly (temporary solution)
    return NextResponse.json({
      message: "Password reset link generated",
      resetLink: resetUrl,
      note: "Copy this link to reset your password (expires in 24 hours)"
    })

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}