import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Verify the token and get the email
    const email = await verifyToken(token)

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Update user's password
    const hashedPassword = await hash(password, 12)
    
    const user = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        emailVerified: new Date() // Also verify email if not already verified
      }
    })

    console.log(`🔑 Password reset successful for: ${user.email}`)

    return NextResponse.json({
      message: "Password reset successfully"
    })

  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}