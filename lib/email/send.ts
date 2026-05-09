// Email sending functions with template rendering

import { readFileSync } from "fs"
import { join } from "path"
import { sendEmail } from "./transport"

interface TemplateVariables {
  [key: string]: string | number
}

function renderTemplate(templatePath: string, variables: TemplateVariables): string {
  const template = readFileSync(templatePath, "utf-8")
  let rendered = template
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g")
    rendered = rendered.replace(regex, String(value))
  }
  
  return rendered
}

// Admin Signup Notification
export async function sendAdminSignupNotification(data: {
  companyName: string
  contactName: string
  email: string
  countryCode: string
  mobile: string
  initialUsers: number
  notes: string
  customerId: string
}): Promise<void> {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"
  
  const templatePath = join(process.cwd(), "lib/email/templates/admin-signup-notification.html")
  const html = renderTemplate(templatePath, data)
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Customer Signup: ${data.companyName}`,
    html,
    text: `New customer signup: ${data.companyName}\nContact: ${data.contactName}\nEmail: ${data.email}\nPhone: ${data.countryCode} ${data.mobile}\nInitial Users: ${data.initialUsers}\nNotes: ${data.notes}\nCustomer ID: ${data.customerId}`,
  })
}

// Customer Confirmation
export async function sendCustomerConfirmation(data: {
  email: string
  companyName: string
  customerId: string
}): Promise<void> {
  const templatePath = join(process.cwd(), "lib/email/templates/customer-confirmation.html")
  const html = renderTemplate(templatePath, data)
  
  await sendEmail({
    to: data.email,
    subject: "Registration Received - iVALT OnDemand ID",
    html,
    text: `Thank you for registering ${data.companyName} for iVALT OnDemand ID trial access.\n\nReference ID: ${data.customerId}\n\nAn iVALT representative will provision your IDCONNECTION code within one business day.`,
  })
}

// Admin Verification Alert
export async function sendAdminVerificationAlert(data: {
  idConnection: string
  countryCode: string
  mobile: string
  status: string
  ivaltStatusCode: number
  requestId: string
}): Promise<void> {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"
  
  const templatePath = join(process.cwd(), "lib/email/templates/admin-verification-alert.html")
  const html = renderTemplate(templatePath, data)
  
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Verification Attempt: ${data.idConnection}`,
    html,
    text: `Verification attempt:\nIDCONNECTION: ${data.idConnection}\nMobile: ${data.countryCode} ${data.mobile}\nStatus: ${data.status}\niVALT Status Code: ${data.ivaltStatusCode}\nRequest ID: ${data.requestId}`,
  })
}
