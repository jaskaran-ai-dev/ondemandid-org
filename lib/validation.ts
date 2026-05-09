import { z } from "zod"

export const signupSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(255, "Company name must be at most 255 characters"),
  contactName: z
    .string()
    .trim()
    .min(2, "Contact name must be at least 2 characters")
    .max(255, "Contact name must be at most 255 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(320, "Email is too long"),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, "Country code must look like +1 or +44"),
  mobile: z
    .string()
    .regex(/^\d{6,14}$/, "Mobile number must be 6–14 digits, no spaces or dashes"),
  initialUsers: z
    .number({ invalid_type_error: "Enter a number" })
    .int("Must be a whole number")
    .min(1, "Must onboard at least 1 user")
    .max(100, "Maximum 100 users for the trial"),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

export type SignupValues = z.infer<typeof signupSchema>

export const verifySchema = z.object({
  idConnection: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4,12}$/, "IDCONNECTION must be 4–12 alphanumeric characters"),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, "Country code must look like +1 or +44"),
  mobile: z
    .string()
    .regex(/^\d{6,14}$/, "Mobile number must be 6–14 digits, no spaces or dashes"),
})

export type VerifyValues = z.infer<typeof verifySchema>
