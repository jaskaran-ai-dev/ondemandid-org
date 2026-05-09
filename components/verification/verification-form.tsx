"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ScanFace } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CodeIcon, PhoneCall } from "@hugeicons/core-free-icons"
import { verifySchema, type VerifyValues } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"

type Props = {
  onSubmit: (values: VerifyValues) => Promise<void>
  submitting?: boolean
}

export function VerificationForm({ onSubmit, submitting }: Props) {
  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      idConnection: "",
      countryCode: "+1",
      mobile: "",
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
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="idConnection" className="text-sm font-medium">
          IDCONNECTION code
        </Label>
        <Input
          id="idConnection"
          placeholder="ACME7421"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!errors.idConnection}
          disabled={submitting}
          className="font-mono uppercase tracking-wider"
          leftIcon={<HugeiconsIcon icon={CodeIcon} size={18} />}
          {...register("idConnection", {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase()
            },
          })}
        />
        {errors.idConnection ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.idConnection.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            4–12 characters, provided by your iVALT administrator.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mobile" className="text-sm font-medium">
          User mobile number
        </Label>
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
          leftIcon={<HugeiconsIcon icon={PhoneCall} size={18} />}
        />
        {errors.mobile ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.mobile.message}
          </p>
        ) : errors.countryCode ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.countryCode.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            The mobile number registered with iVALT for this user.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-2 w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
            Sending request…
          </>
        ) : (
          <>
            <ScanFace className="mr-1 size-4" aria-hidden />
            Send verification request
          </>
        )}
      </Button>
    </form>
  )
}
