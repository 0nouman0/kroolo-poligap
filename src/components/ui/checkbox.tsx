"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
  className,
  onCheckedChange, 
  checked,
  onChange,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    onChange?.(e);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground appearance-none",
          className
        )}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      {checked && (
        <CheckIcon className="h-3 w-3 absolute left-0.5 top-0.5 text-white pointer-events-none" />
      )}
    </div>
  )
}

export { Checkbox }
