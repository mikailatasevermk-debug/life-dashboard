import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createVerificationToken, sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create new user
    const hashedPassword = await hash(password, 12)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
      },
    })

    // Send verification email
    try {
      const token = await createVerificationToken(newUser.email)
      const result = await sendVerificationEmail(newUser.email, token)
      
      if (result) {
        console.log(`✅ Verification email sent successfully to: ${newUser.email}`)
      } else {
        console.log(`❌ Failed to send verification email to: ${newUser.email}`)
      }
      console.log(`🔗 Verification link: ${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      // Continue with registration even if email fails
    }

    return NextResponse.json({
      message: "Registration successful! Check your email for verification link.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}