"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COUNTRY_CODES, type CountryCode } from "@/lib/country-codes"

type PhoneInputProps = {
  countryCode: string
  mobile: string
  onCountryCodeChange: (code: string) => void
  onMobileChange: (mobile: string) => void
  disabled?: boolean
  id?: string
  ariaInvalid?: boolean
  ariaDescribedBy?: string
}

export function PhoneInput({
  countryCode,
  mobile,
  onCountryCodeChange,
  onMobileChange,
  disabled,
  id,
  ariaInvalid,
  ariaDescribedBy,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false)

  const selected: CountryCode | undefined = React.useMemo(
    () => COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0],
    [countryCode],
  )

  return (
    <div className="flex w-full items-stretch gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select country dialing code"
            disabled={disabled}
            className="w-[120px] justify-between font-normal"
          >
            <span className="flex items-center gap-2 truncate">
              <span aria-hidden className="text-base leading-none">
                {selected?.flag}
              </span>
              <span className="font-mono text-sm">{selected?.code}</span>
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRY_CODES.map((c) => {
                  const value = `${c.name} ${c.code} ${c.iso}`
                  const isSelected =
                    selected?.iso === c.iso && selected?.code === c.code
                  return (
                    <CommandItem
                      key={`${c.iso}-${c.code}`}
                      value={value}
                      onSelect={() => {
                        onCountryCodeChange(c.code)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="mr-2 text-base leading-none" aria-hidden>
                        {c.flag}
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {c.code}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="5551234567"
        value={mobile}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={(e) => {
          // Strip everything but digits.
          const digits = e.target.value.replace(/\D/g, "").slice(0, 14)
          onMobileChange(digits)
        }}
        className="flex-1"
      />
    </div>
  )
}
