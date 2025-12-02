import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  hover?: boolean
  variant?: "glass" | "solid"
}

export function GlassCard({ children, className, hover = false, variant = "solid", ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6",
        variant === "solid"
          ? "bg-white border border-gray-100 shadow-sm"
          : "bg-white/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
