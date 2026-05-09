// Email transport factory - AWS SES with SMTP fallback

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import nodemailer from "nodemailer"

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "ses"

let transporter: nodemailer.Transporter | null = null

// AWS SES Transport
async function createSesTransport(): Promise<nodemailer.Transporter> {
  const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  })

  return nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SES: sesClient } },
  })
}

// SMTP Transport (fallback)
async function createSmtpTransport(): Promise<nodemailer.Transporter> {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  })
}

// Get or create transport
export async function getTransport(): Promise<nodemailer.Transporter> {
  if (transporter) {
    return transporter
  }

  try {
    if (EMAIL_PROVIDER === "ses") {
      transporter = await createSesTransport()
      console.log("Using AWS SES for email transport")
    } else {
      transporter = await createSmtpTransport()
      console.log("Using SMTP for email transport")
    }
  } catch (error) {
    console.error("Failed to create primary email transport, falling back to SMTP:", error)
    try {
      transporter = await createSmtpTransport()
      console.log("Fallback to SMTP successful")
    } catch (fallbackError) {
      console.error("SMTP fallback also failed:", fallbackError)
      throw new Error("Failed to initialize any email transport")
    }
  }

  return transporter
}

// Send email with automatic transport selection and fallback
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<void> {
  const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com"

  try {
    const transport = await getTransport()
    await transport.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    console.log(`Email sent to ${options.to}`)
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error)
    // Graceful degradation - don't block user flow
    throw error
  }
}
