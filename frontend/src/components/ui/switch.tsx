import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "peer h-6 w-11 appearance-none rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          className
        )}
        style={{
          backgroundColor: checked ? 'var(--ai-primary, #6366f1)' : 'rgba(255, 255, 255, 0.2)',
          '--tw-ring-color': 'var(--ai-primary, #6366f1)'
        } as React.CSSProperties}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
