import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createVerificationToken, sendPasswordResetEmail } from "@/lib/email"

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

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link."
      })
    }

    // Create password reset token
    try {
      const token = await createVerificationToken(user.email)
      await sendPasswordResetEmail(user.email, token)
      
      console.log(`🔑 Password reset email sent to: ${user.email}`)
      console.log(`🔗 Reset link: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`)
    } catch (error) {
      console.error("Failed to send password reset email:", error)
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link."
    })

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}