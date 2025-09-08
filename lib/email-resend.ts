import { prisma } from './prisma'

// Alternative email implementation using Resend API
const RESEND_API_KEY = process.env.RESEND_API_KEY

async function sendEmailViaResend(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('📧 Email would be sent (no Resend API key configured):')
    console.log('To:', to)
    console.log('Subject:', subject)
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Life Dashboard <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Email sent successfully via Resend:', data.id)
      return { success: true, id: data.id }
    } else {
      console.error('❌ Failed to send email:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmailViaResend(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const html = `
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy this link: ${resetUrl}</p>
            
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmailViaResend(email, 'Reset your password - Life Dashboard', html)
}

export async function sendVerificationEmailViaResend(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Welcome to Life Dashboard!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Thanks for signing up! Please verify your email to get started.</p>
            
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verify Email</a>
            </div>
            
            <p>Or copy this link: ${verifyUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmailViaResend(email, 'Verify your email - Life Dashboard', html)
}