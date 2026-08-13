'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COUNTRY_CODES, type CountryCode } from '@/lib/country-codes';

type PhoneInputProps = {
  countryCode: string;
  mobile: string;
  onCountryCodeChange: (code: string) => void;
  onMobileChange: (mobile: string) => void;
  disabled?: boolean;
  id?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  leftIcon?: React.ReactNode;
};

export function PhoneInput({
  countryCode,
  mobile,
  onCountryCodeChange,
  onMobileChange,
  disabled,
  id,
  ariaInvalid,
  ariaDescribedBy,
  leftIcon,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);

  const selected: CountryCode | undefined = React.useMemo(
    () => COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0],
    [countryCode]
  );

  return (
    <div
      className={cn(
        'flex h-9 w-full min-w-0 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'dark:bg-input/30',
        ariaInvalid &&
          'border-destructive ring-destructive/20 dark:ring-destructive/40'
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            aria-label="Select country dialing code"
            disabled={disabled}
            className="h-auto w-[7.25rem] shrink-0 justify-between rounded-none border-0 border-r border-input px-2.5 font-normal shadow-none hover:bg-secondary/60 dark:hover:bg-input/50"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden className="text-base leading-none">
                {selected?.flag}
              </span>
              <span className="font-mono text-sm tabular-nums">
                {selected?.code}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRY_CODES.map(c => {
                  const value = `${c.name} ${c.code} ${c.iso}`;
                  const isSelected =
                    selected?.iso === c.iso && selected?.code === c.code;
                  return (
                    <CommandItem
                      key={`${c.iso}-${c.code}`}
                      value={value}
                      onSelect={() => {
                        onCountryCodeChange(c.code);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
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
                  );
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
        leftIcon={leftIcon}
        onChange={e => {
          // Strip everything but digits.
          const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
          onMobileChange(digits);
        }}
        containerClassName="flex-1"
        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  );
}
