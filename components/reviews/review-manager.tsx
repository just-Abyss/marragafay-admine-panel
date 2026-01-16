"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createAuthClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Review } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Check,
    Trash2,
    Star,
    MessageSquare,
    Search,
    Filter,
    XCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Users,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ReviewDrawer } from "./review-drawer"

// ============================================================================
// TYPES
// ============================================================================
type StatusFilter = "all" | "pending" | "approved" | "rejected"
type RatingFilter = "all" | "5" | "4" | "low"

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ReviewManager() {
    // ⚠️ CRITICAL: Use auth-aware Supabase client (includes session cookies for RLS)
    const supabase = createAuthClient()

    // Prevent hydration mismatch - only render interactive elements after mount
    const [mounted, setMounted] = useState(false)

    // State
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")


    // Drawer State
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<string[]>([])

    // Set mounted on client
    useEffect(() => {
        setMounted(true)
    }, [])
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // ========================================================================
    // DATA FETCHING
    // ========================================================================
    const fetchReviews = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setReviews(data || [])
        } catch (error) {
            console.error("Error fetching reviews:", error)
            toast.error("Failed to load reviews")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    // ========================================================================
    // COMPUTED STATS
    // ========================================================================
    const stats = useMemo(() => {
        const total = reviews.length
        const pending = reviews.filter(r => r.status === "pending").length
        const approved = reviews.filter(r => r.status === "approved").length
        const rejected = reviews.filter(r => r.status === "rejected").length

        // Calculate average from approved reviews only
        const approvedReviews = reviews.filter(r => r.status === "approved")
        const totalStars = approvedReviews.reduce((acc, r) => acc + (r.rating || 0), 0)
        const avgRating = approvedReviews.length > 0
            ? (totalStars / approvedReviews.length).toFixed(1)
            : "0.0"

        // Approval rate = approved / (approved + rejected) * 100
        const decidedCount = approved + rejected
        const approvalRate = decidedCount > 0
            ? Math.round((approved / decidedCount) * 100)
            : 0

        return { total, pending, approved, rejected, avgRating, approvalRate }
    }, [reviews])

    // ========================================================================
    // FILTERING
    // ========================================================================
    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesName = review.name?.toLowerCase().includes(query)
                const matchesComment = review.comment?.toLowerCase().includes(query)
                const matchesEmail = review.email?.toLowerCase().includes(query)
                if (!matchesName && !matchesComment && !matchesEmail) return false
            }

            // Status filter
            if (statusFilter !== "all" && review.status !== statusFilter) {
                return false
            }

            // Rating filter
            if (ratingFilter !== "all") {
                if (ratingFilter === "5" && review.rating !== 5) return false
                if (ratingFilter === "4" && review.rating !== 4) return false
                if (ratingFilter === "low" && review.rating >= 3) return false
            }

            return true
        })
    }, [reviews, searchQuery, statusFilter, ratingFilter])

    // ========================================================================
    // SELECTION
    // ========================================================================
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredReviews.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredReviews.map(r => r.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
        // Optimistic Update
        const previousReviews = [...reviews]
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))

        try {
            // ⚠️ STRICT DEBUGGING: Use .select() after update to catch silent RLS failures
            const { data, error } = await supabase
                .from("reviews")
                .update({ status: newStatus })
                .eq("id", id)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.code, error.details)
                throw new Error(`Supabase error: ${error.message}`)
            }

            // Check if RLS blocked the operation silently
            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows were updated. Check your RLS policies!")
                throw new Error("Operation failed: RLS blocked execution or ID mismatch")
            }

            console.log("✅ Update successful:", data)
            toast.success(newStatus === "approved" ? "Review approved" : "Review rejected")
        } catch (error: unknown) {
            const err = error as { message?: string }
            console.error("❌ Error updating status:", err?.message || error)
            setReviews(previousReviews)
            toast.error(err?.message || "Failed to update status")
        }
    }

    const updateReview = async (updatedReview: Review) => {
        // Optimistic Update
        const previousReviews = [...reviews]
        setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r))
        // Also update selected review if it's open
        setSelectedReview(updatedReview)

        try {
            // Build update payload with only editable fields
            const updateData: Record<string, unknown> = {
                comment: updatedReview.comment,
                rating: updatedReview.rating,
                status: updatedReview.status,
            }

            // Always include images array (even if empty) to support deletion
            const imagesToSave = updatedReview.images ?? []
            updateData.images = imagesToSave
            console.log("🖼️ Images being saved to DB:", imagesToSave)

            // Handle legacy image_url (first image or null)
            if (updatedReview.image_url !== undefined) {
                updateData.image_url = updatedReview.image_url || null
            } else if (imagesToSave.length > 0) {
                // Sync image_url with first image if not explicitly set
                updateData.image_url = imagesToSave[0]
            } else {
                // Clear image_url if no images
                updateData.image_url = null
            }

            console.log("📤 Full update payload:", updateData)

            const { data, error } = await supabase
                .from("reviews")
                .update(updateData)
                .eq("id", updatedReview.id)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.details)
                throw error
            }

            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows updated")
                throw new Error("RLS blocked update")
            }

            console.log("✅ Review updated successfully:", data[0])
            toast.success("Review updated successfully")
        } catch (error) {
            console.error("❌ Error updating review:", error)
            setReviews(previousReviews)
            toast.error("Failed to update review")
        }
    }

    const deleteReview = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this review?")) return

        const previousReviews = [...reviews]
        setReviews(prev => prev.filter(r => r.id !== id))
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })

        try {
            // ⚠️ STRICT DEBUGGING: Use .select() after delete to catch silent RLS failures
            const { data, error } = await supabase
                .from("reviews")
                .delete()
                .eq("id", id)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.details)
                throw new Error(`Supabase error: ${error.message}`)
            }

            // Check if RLS blocked the operation silently
            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows were deleted. Check your RLS policies!")
                throw new Error("Operation failed: RLS blocked execution or ID mismatch")
            }

            console.log("✅ Delete successful:", data)
            toast.success("Review deleted")
        } catch (error: unknown) {
            const err = error as { message?: string }
            console.error("❌ Error deleting review:", err?.message || error)
            setReviews(previousReviews)
            toast.error(err?.message || "Failed to delete review")
        }
    }

    const bulkApprove = async () => {
        if (selectedIds.size === 0) return

        const idsToApprove = Array.from(selectedIds)
        const previousReviews = [...reviews]

        // Optimistic update
        setReviews(prev => prev.map(r =>
            idsToApprove.includes(r.id) ? { ...r, status: "approved" as const } : r
        ))
        setSelectedIds(new Set())

        try {
            // ⚠️ STRICT DEBUGGING: Use .select() to catch silent RLS failures
            const { data, error } = await supabase
                .from("reviews")
                .update({ status: "approved" })
                .in("id", idsToApprove)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.details)
                throw new Error(`Supabase error: ${error.message}`)
            }

            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows updated. Check RLS policies!")
                throw new Error("Bulk approve failed: RLS blocked execution")
            }

            console.log(`✅ Bulk approved ${data.length} review(s)`)
            toast.success(`${data.length} review(s) approved`)
        } catch (error: unknown) {
            const err = error as { message?: string }
            console.error("❌ Error bulk approving:", err?.message || error)
            setReviews(previousReviews)
            toast.error(err?.message || "Failed to approve selected reviews")
        }
    }

    const bulkReject = async () => {
        if (selectedIds.size === 0) return

        const idsToReject = Array.from(selectedIds)
        const previousReviews = [...reviews]

        // Optimistic update
        setReviews(prev => prev.map(r =>
            idsToReject.includes(r.id) ? { ...r, status: "rejected" as const } : r
        ))
        setSelectedIds(new Set())

        try {
            const { data, error } = await supabase
                .from("reviews")
                .update({ status: "rejected" })
                .in("id", idsToReject)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.details)
                throw new Error(`Supabase error: ${error.message}`)
            }

            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows updated")
                throw new Error("Bulk reject failed: RLS blocked execution")
            }

            console.log(`✅ Bulk rejected ${data.length} review(s)`)
            toast.success(`${data.length} review(s) rejected`)
        } catch (error: unknown) {
            const err = error as { message?: string }
            console.error("❌ Error bulk rejecting:", err?.message || error)
            setReviews(previousReviews)
            toast.error(err?.message || "Failed to reject selected reviews")
        }
    }

    const bulkDelete = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`Are you sure you want to permanently delete ${selectedIds.size} review(s)? This cannot be undone.`)) return

        const idsToDelete = Array.from(selectedIds)
        const previousReviews = [...reviews]

        // Optimistic update
        setReviews(prev => prev.filter(r => !idsToDelete.includes(r.id)))
        setSelectedIds(new Set())

        try {
            const { data, error } = await supabase
                .from("reviews")
                .delete()
                .in("id", idsToDelete)
                .select()

            if (error) {
                console.error("💥 Supabase error:", error.message, error.details)
                throw new Error(`Supabase error: ${error.message}`)
            }

            if (!data || data.length === 0) {
                console.error("💥 RLS BLOCKED: No rows deleted")
                throw new Error("Bulk delete failed: RLS blocked execution")
            }

            console.log(`✅ Bulk deleted ${data.length} review(s)`)
            toast.success(`${data.length} review(s) deleted`)
        } catch (error: unknown) {
            const err = error as { message?: string }
            console.error("❌ Error bulk deleting:", err?.message || error)
            setReviews(previousReviews)
            toast.error(err?.message || "Failed to delete selected reviews")
        }
    }





    // ========================================================================
    // LIGHTBOX
    // ========================================================================
    const openLightbox = (images: string[], startIndex: number = 0) => {
        setLightboxImages(images)
        setLightboxIndex(startIndex)
        setLightboxOpen(true)
    }

    // ========================================================================
    // HELPERS
    // ========================================================================
    const getInitials = (name: string) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map(n => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
    }

    const getReviewImages = (review: Review): string[] => {
        const imgs: string[] = []
        if (review.images && review.images.length > 0) {
            imgs.push(...review.images)
        }
        if (review.image_url && !imgs.includes(review.image_url)) {
            imgs.push(review.image_url)
        }
        return imgs
    }

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "MMM d, yyyy")
        } catch {
            return dateStr
        }
    }

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "approved":
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 gap-1 pl-1.5 shadow-none font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 gap-1 pl-1.5 shadow-none font-medium">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 pl-1.5 shadow-none font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                    </Badge>
                )
        }
    }

    const RatingStars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
        const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={cn(
                            sizeClass,
                            star <= rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-zinc-200 fill-zinc-100"
                        )}
                    />
                ))}
            </div>
        )
    }

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="space-y-6">
            {/* ================================================================
                STATS COMMAND CENTER
            ================================================================ */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Reviews */}
                <Card className="border-zinc-200/60 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Total Reviews
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
                        <p className="text-xs text-zinc-500 mt-1">All time submissions</p>
                    </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card className={cn(
                    "border-zinc-200/60 shadow-sm",
                    stats.pending > 0 ? "bg-amber-50/50 border-amber-200/60" : "bg-white"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Pending Actions
                        </CardTitle>
                        <AlertCircle className={cn(
                            "h-4 w-4",
                            stats.pending > 0 ? "text-amber-500" : "text-zinc-400"
                        )} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            stats.pending > 0 ? "text-amber-600" : "text-zinc-900"
                        )}>{stats.pending}</div>
                        <p className="text-xs text-zinc-500 mt-1">Requires your attention</p>
                    </CardContent>
                </Card>

                {/* Average Rating */}
                <Card className="border-zinc-200/60 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-zinc-900">{stats.avgRating}</span>
                            <RatingStars rating={Math.round(parseFloat(stats.avgRating))} size="sm" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">From {stats.approved} approved</p>
                    </CardContent>
                </Card>

                {/* Approval Rate */}
                <Card className="border-zinc-200/60 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                            Approval Rate
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{stats.approvalRate}%</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {stats.approved} approved, {stats.rejected} rejected
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ================================================================
                TOOLBAR
            ================================================================ */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-zinc-200/60 rounded-xl p-4 shadow-sm">
                {/* Left: Search & Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search by name, email, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm border-zinc-200"
                        />
                    </div>

                    {/* Status Filter - only render after mount to prevent hydration mismatch */}
                    {mounted ? (
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                            <SelectTrigger className="w-[140px] h-9 text-sm border-zinc-200">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="w-[140px] h-9 bg-zinc-100 rounded-md animate-pulse" />
                    )}

                    {/* Rating Filter - only render after mount to prevent hydration mismatch */}
                    {mounted ? (
                        <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v as RatingFilter)}>
                            <SelectTrigger className="w-[130px] h-9 text-sm border-zinc-200">
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="low">Below 3</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="w-[130px] h-9 bg-zinc-100 rounded-md animate-pulse" />
                    )}
                </div>

                {/* Right: Bulk Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedIds.size > 0 && (
                        <>
                            <span className="text-sm text-zinc-500 font-medium">
                                {selectedIds.size} selected
                            </span>
                            <div className="h-4 w-px bg-zinc-200" />
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkApprove}
                        disabled={selectedIds.size === 0}
                        className="gap-1.5 h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkReject}
                        disabled={selectedIds.size === 0}
                        className="gap-1.5 h-9 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                    >
                        <XCircle className="h-4 w-4" />
                        Reject
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkDelete}
                        disabled={selectedIds.size === 0}
                        className="gap-1.5 h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* ================================================================
                DATA TABLE
            ================================================================ */}
            <div className="rounded-xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
                            <TableHead className="w-[50px] pl-4">
                                <Checkbox
                                    checked={filteredReviews.length > 0 && selectedIds.size === filteredReviews.length}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-zinc-300"
                                />
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500 min-w-[200px]">
                                Customer
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[100px]">
                                Date
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[120px]">
                                Rating
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Review
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[100px]">
                                Photos
                            </TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[110px]">
                                Status
                            </TableHead>
                            {/* Actions column removed for Master-Detail view */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} className="py-4">
                                        <div className="h-10 w-full animate-pulse bg-zinc-100 rounded" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredReviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-zinc-400">
                                        <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                                        <p className="font-medium">No reviews found</p>
                                        <p className="text-sm mt-1">Try adjusting your filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReviews.map((review) => {
                                const images = getReviewImages(review)
                                return (
                                    <TableRow
                                        key={review.id}
                                        className={cn(
                                            "group transition-colors cursor-pointer",
                                            selectedIds.has(review.id) ? "bg-zinc-50" : "hover:bg-zinc-50/50"
                                        )}
                                        onClick={(e) => {
                                            // Prevent drawer open if clicking checkbox or other interactive elements
                                            if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) {
                                                return
                                            }
                                            setSelectedReview(review)
                                            setIsDrawerOpen(true)
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <TableCell className="pl-4">
                                            <Checkbox
                                                checked={selectedIds.has(review.id)}
                                                onCheckedChange={() => toggleSelect(review.id)}
                                                className="border-zinc-300"
                                            />
                                        </TableCell>

                                        {/* Customer */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-zinc-200 shrink-0">
                                                    <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-50 text-zinc-600 text-xs font-semibold">
                                                        {getInitials(review.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-sm text-zinc-900 truncate">
                                                        {review.name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500 truncate">
                                                        {review.email || "No email"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="text-sm text-zinc-600">
                                            {formatDate(review.created_at)}
                                        </TableCell>

                                        {/* Rating */}
                                        <TableCell>
                                            <RatingStars rating={review.rating} />
                                        </TableCell>

                                        {/* Review Text */}
                                        <TableCell className="max-w-[300px]">
                                            <p className="text-sm text-zinc-600 line-clamp-2">
                                                {review.comment}
                                            </p>
                                        </TableCell>

                                        {/* Photos */}
                                        <TableCell>
                                            {images.length > 0 ? (
                                                <button
                                                    onClick={() => openLightbox(images, 0)}
                                                    className="flex items-center gap-1 group/photos"
                                                >
                                                    <div className="flex -space-x-2">
                                                        {images.slice(0, 3).map((img, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="h-8 w-8 rounded-md border-2 border-white overflow-hidden shadow-sm"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                        {images.length > 3 && (
                                                            <div className="h-8 w-8 rounded-md border-2 border-white bg-zinc-100 flex items-center justify-center text-xs font-medium text-zinc-600 shadow-sm">
                                                                +{images.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-zinc-300">—</span>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <StatusBadge status={review.status} />
                                        </TableCell>

                                        {/* Actions cell removed for Master-Detail view */}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Footer */}
                {!loading && filteredReviews.length > 0 && (
                    <div className="border-t border-zinc-100 px-4 py-3 bg-zinc-50/50">
                        <p className="text-sm text-zinc-500">
                            Showing {filteredReviews.length} of {reviews.length} reviews
                        </p>
                    </div>
                )}
            </div>

            {/* ================================================================
                REVIEW DRAWER (Master-Detail)
            ================================================================ */}
            <ReviewDrawer
                review={selectedReview}
                open={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false)
                    setSelectedReview(null)
                }}
                onApprove={(id) => updateStatus(id, "approved")}
                onReject={(id) => updateStatus(id, "rejected")}
                onDelete={(id) => deleteReview(id)}
                onUpdate={updateReview}
            />

            {/* ================================================================
                LIGHTBOX
            ================================================================ */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-3xl p-0 border-none bg-transparent shadow-none">
                    <DialogTitle className="sr-only">Review Image</DialogTitle>
                    <div className="relative">
                        <img
                            src={lightboxImages[lightboxIndex]}
                            alt=""
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />

                        {/* Navigation */}
                        {lightboxImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Counter */}
                        {lightboxImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                                {lightboxIndex + 1} / {lightboxImages.length}
                            </div>
                        )}

                        {/* Close */}
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
