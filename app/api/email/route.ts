import { type NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, message } = body

    // Validate input
    if (!email || !name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.MY_EMAIL || !process.env.MY_PASSWORD) {
      console.error('Environment variables missing:', {
        hasEmail: !!process.env.MY_EMAIL,
        hasPassword: !!process.env.MY_PASSWORD,
      })
      return NextResponse.json(
        { error: 'Email configuration is missing' },
        { status: 500 }
      )
    }

    // Escape HTML in user input to prevent XSS
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    })

    // Verify connection
    await transport.verify()

    const mailOptions: Mail.Options = {
      from: process.env.MY_EMAIL,
      to: process.env.MY_EMAIL,
      replyTo: email,
      subject: `SAT Tutoring Inquiry from ${escapeHtml(name)} (${escapeHtml(email)})`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${phone ? escapeHtml(phone) : 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    }

    const sendMailPromise = () =>
      new Promise<string>((resolve, reject) => {
        transport.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.error('Nodemailer error:', err)
            reject(err.message || 'Failed to send email')
          } else {
            console.log('Email sent successfully:', info.messageId)
            resolve('Email sent')
          }
        })
      })

    await sendMailPromise()
    return NextResponse.json({ message: 'Email sent' })
  } catch (err) {
    console.error('Error sending email:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

