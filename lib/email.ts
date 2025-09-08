import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// For development, we'll use console.log
// For production, you'll need to configure a real email service
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Create a test transporter for development
const createTransporter = () => {
  if (IS_PRODUCTION && process.env.SMTP_HOST) {
    // Production configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  
  // Development - just log to console
  return {
    sendMail: async (options: any) => {
      console.log('📧 Email would be sent in production:')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('Content:', options.html || options.text)
      return { messageId: 'dev-' + Date.now() }
    }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const transporter = createTransporter()
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Life Dashboard" <noreply@lifedashboard.app>',
    to: email,
    subject: 'Verify your email - Life Dashboard',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Life Dashboard!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! Please verify your email address to complete your registration and start organizing your life.</p>
              
              <div style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="warning">
                <strong>⏰ This link expires in 24 hours</strong><br>
                If you didn't create an account, you can safely ignore this email.
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${verifyUrl}</p>
              
              <div class="footer">
                <p>Life Dashboard - Organize Every Aspect of Your Life</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Life Dashboard!
      
      Please verify your email address by clicking the link below:
      ${verifyUrl}
      
      This link expires in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `
  }
  
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

export async function createVerificationToken(email: string): Promise<string> {
  // Generate a random token
  const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('')
  
  // Store in database with 24 hour expiry
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)
  
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })
  
  return token
}

export async function verifyToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })
  
  if (!verificationToken) {
    return null
  }
  
  // Check if expired
  if (new Date() > verificationToken.expires) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token }
    })
    return null
  }
  
  // Delete used token
  await prisma.verificationToken.delete({
    where: { token }
  })
  
  return verificationToken.identifier
}