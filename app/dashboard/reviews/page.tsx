"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReviewManager } from "@/components/reviews/review-manager"

export default function ReviewsPage() {
    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                        Review Moderation
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Manage customer reviews. Approve or reject reviews to control their visibility.
                    </p>
                </div>
                <ReviewManager />
            </div>
        </DashboardLayout>
    )
}
