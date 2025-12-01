import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/lib/types"

interface PaymentBadgeProps {
  status: PaymentStatus
  className?: string
  size?: "sm" | "default"
}

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  deposit: {
    label: "Deposit",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

export function PaymentBadge({ status, className, size = "default" }: PaymentBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
