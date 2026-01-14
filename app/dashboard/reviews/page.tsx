"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReviewManager } from "@/components/reviews/review-manager"

export default function ReviewsPage() {
    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                        Reviews Management
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Full business control over customer feedback. Approve, edit, or reject reviews.
                    </p>
                </div>

                {/* Main Component */}
                <ReviewManager />
            </div>
        </DashboardLayout>
    )
}
