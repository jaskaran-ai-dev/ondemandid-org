"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { signupSchema, type SignupValues } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"

type Props = {
  onSubmit: (values: SignupValues) => Promise<void>
  submitting?: boolean
}

export function SignupForm({ onSubmit, submitting }: Props) {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      countryCode: "+1",
      mobile: "",
      initialUsers: 10,
      notes: "",
    },
    mode: "onTouched",
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const countryCode = watch("countryCode")
  const mobile = watch("mobile")

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label="Company name"
          htmlFor="companyName"
          error={errors.companyName?.message}
        >
          <Input
            id="companyName"
            placeholder="Acme Corporation"
            aria-invalid={!!errors.companyName}
            disabled={submitting}
            {...register("companyName")}
          />
        </Field>

        <Field
          label="Primary contact"
          htmlFor="contactName"
          error={errors.contactName?.message}
        >
          <Input
            id="contactName"
            placeholder="Jane Doe"
            autoComplete="name"
            aria-invalid={!!errors.contactName}
            disabled={submitting}
            {...register("contactName")}
          />
        </Field>

        <Field
          label="Work email"
          htmlFor="email"
          error={errors.email?.message}
          className="md:col-span-2"
        >
          <Input
            id="email"
            type="email"
            placeholder="jane@acme.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={submitting}
            {...register("email")}
          />
        </Field>

        <Field
          label="Mobile number"
          htmlFor="mobile"
          error={errors.mobile?.message ?? errors.countryCode?.message}
          hint="Used for the contact record only — not for verification."
          className="md:col-span-2"
        >
          <PhoneInput
            id="mobile"
            countryCode={countryCode}
            mobile={mobile}
            onCountryCodeChange={(code) =>
              setValue("countryCode", code, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onMobileChange={(m) =>
              setValue("mobile", m, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            disabled={submitting}
            ariaInvalid={!!errors.mobile}
          />
        </Field>

        <Field
          label="Initial users for trial"
          htmlFor="initialUsers"
          error={errors.initialUsers?.message}
          hint="Between 1 and 100 users."
        >
          <Input
            id="initialUsers"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            aria-invalid={!!errors.initialUsers}
            disabled={submitting}
            {...register("initialUsers", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field
        label="Notes"
        htmlFor="notes"
        error={errors.notes?.message}
        hint="Optional. Tell us about your use case or compliance requirements."
      >
        <Textarea
          id="notes"
          rows={4}
          placeholder="We're evaluating iVALT for executive identity verification…"
          disabled={submitting}
          {...register("notes")}
        />
      </Field>

      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By submitting, you agree to be contacted by an iVALT representative
          about provisioning your trial.
        </p>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            "Request trial access"
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
