"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { mockTestimonials } from "@/lib/mock-data"
import type { Testimonial } from "@/lib/types"
import { Loader2, Star, Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TestimonialsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleStatusChange = (id: string, newStatus: "approved" | "rejected") => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19B76]" />
      </div>
    )
  }

  const pendingCount = testimonials.filter((t) => t.status === "pending").length

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer reviews and feedback
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>

        {/* Testimonials List */}
        <div className="space-y-4 animate-slide-up">
          {testimonials.map((testimonial, i) => (
            <GlassCard
              key={testimonial.id}
              className={cn("transition-all duration-200", testimonial.status === "rejected" && "opacity-50")}
              style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C19B76]/10 flex items-center justify-center">
                      <span className="font-semibold text-[#C19B76]">{testimonial.customer_name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(testimonial.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          "w-4 h-4",
                          idx < testimonial.rating ? "fill-[#C19B76] text-[#C19B76]" : "text-slate-200",
                        )}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">({testimonial.rating}/5)</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                </div>

                {/* Status & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      testimonial.status === "approved" && "bg-emerald-100 text-emerald-700",
                      testimonial.status === "pending" && "bg-amber-100 text-amber-700",
                      testimonial.status === "rejected" && "bg-red-100 text-red-700",
                    )}
                  >
                    {testimonial.status === "approved" && <Check className="w-3 h-3" />}
                    {testimonial.status === "pending" && <Clock className="w-3 h-3" />}
                    {testimonial.status === "rejected" && <X className="w-3 h-3" />}
                    {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                  </span>

                  {testimonial.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => handleStatusChange(testimonial.id, "approved")}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-red-500 hover:bg-red-50 bg-transparent"
                        onClick={() => handleStatusChange(testimonial.id, "rejected")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {testimonial.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-muted-foreground"
                      onClick={() =>
                        handleStatusChange(testimonial.id, testimonial.status === "approved" ? "rejected" : "approved")
                      }
                    >
                      {testimonial.status === "approved" ? "Reject" : "Approve"}
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
