"use client"

import React, { useState, useEffect } from "react"
import type { Review } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Star,
    CheckCircle2,
    XCircle,
    Trash2,
    MessageSquare,
    Calendar,
    X,
    Pencil,
    Save,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface ReviewDrawerProps {
    review: Review | null
    open: boolean
    onClose: () => void
    onApprove?: (reviewId: string) => void
    onReject?: (reviewId: string) => void
    onDelete?: (reviewId: string) => void
    onUpdate?: (review: Review) => Promise<void>
}

export function ReviewDrawer({
    review,
    open,
    onClose,
    onApprove,
    onReject,
    onDelete,
    onUpdate,
}: ReviewDrawerProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<string[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(0)

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Review | null>(null)
    const [currentImages, setCurrentImages] = useState<string[]>([])

    // Helper function to extract images from review
    const getReviewImagesStatic = (r: Review): string[] => {
        const imgs: string[] = []
        if (r.images && r.images.length > 0) {
            imgs.push(...r.images)
        }
        if (r.image_url && !imgs.includes(r.image_url)) {
            imgs.push(r.image_url)
        }
        return imgs
    }

    // Initialize form data and images when review changes
    React.useEffect(() => {
        if (review && open) {
            console.log("📝 Initializing drawer with review:", review.id)
            setFormData(review)
            const imgs = getReviewImagesStatic(review)
            console.log("🖼️ Initial images:", imgs)
            setCurrentImages(imgs)
            setIsEditing(false)
        }
    }, [review?.id, open])

    // Reset when drawer closes
    React.useEffect(() => {
        if (!open) {
            setIsEditing(false)
        }
    }, [open])

    if (!review) return null

    const getInitials = (name: string) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
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

    const openLightbox = (images: string[], startIndex: number = 0) => {
        setLightboxImages(images)
        setLightboxIndex(startIndex)
        setLightboxOpen(true)
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                    </span>
                )
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <MessageSquare className="w-3 h-3" />
                        Pending
                    </span>
                )
        }
    }

    const images = getReviewImages(review)

    const handleSave = async () => {
        if (!formData || !onUpdate) return

        console.log("💾 Saving review changes...")
        console.log("📊 Current images in state:", currentImages)
        console.log("📝 Form data:", formData)

        // Prepare updated review with current images
        const updatedReview: Review = {
            ...formData,
            images: currentImages.length > 0 ? currentImages : [], // Always send array, never undefined
            image_url: currentImages.length > 0 ? currentImages[0] : undefined,
        }

        console.log("📤 Sending update with images:", updatedReview.images)
        await onUpdate(updatedReview)
        setIsEditing(false)
    }

    const handleCancel = () => {
        console.log("❌ Canceling edit, resetting to original")
        setIsEditing(false)
        setFormData(review)
        // Reset images to original
        if (review) {
            const originalImages = getReviewImagesStatic(review)
            console.log("🔄 Resetting images to:", originalImages)
            setCurrentImages(originalImages)
        }
    }

    // Remove specific image from the local array
    const removeImage = (indexToRemove: number) => {
        console.log(`🗑️ Removing image at index ${indexToRemove}`)
        setCurrentImages(prev => {
            const newImages = prev.filter((_, idx) => idx !== indexToRemove)
            console.log("🖼️ Updated images after removal:", newImages)
            return newImages
        })
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md bg-gray-50 border-0 overflow-hidden flex flex-col p-0"
                >
                    <SheetHeader>
                        <SheetTitle className="sr-only">Review Details</SheetTitle>
                    </SheetHeader>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto pb-32">
                        {/* Header Section - Always Display Only */}
                        <div className="bg-white px-5 pt-4 pb-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                                        <AvatarFallback className="bg-[#C19B76] text-white text-xl font-semibold">
                                            {getInitials(review.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-900">{review.name}</h2>
                                        {review.email && <p className="text-sm text-gray-500 mt-0.5">{review.email}</p>}
                                        <div className="flex items-center gap-2 mt-2">
                                            <StatusBadge status={review.status} />
                                            {isEditing && (
                                                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                                    Editing...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!isEditing && (
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                        <Pencil className="w-4 h-4 text-gray-500" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            {/* Rating Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                                    Rating
                                </h4>
                                <div className="bg-white rounded-2xl shadow-sm p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={!isEditing}
                                                    onClick={() => isEditing && setFormData((prev) => (prev ? { ...prev, rating: star } : null))}
                                                    className={cn(
                                                        isEditing ? "cursor-pointer hover:scale-110 active:scale-95 transition-transform" : "cursor-default",
                                                        "focus:outline-none"
                                                    )}
                                                >
                                                    <Star
                                                        key={star}
                                                        className={cn(
                                                            "h-6 w-6 transition-colors",
                                                            star <= (isEditing ? (formData?.rating || 0) : review.rating)
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-gray-200 fill-gray-100"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {isEditing ? formData?.rating : review.rating}.0
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status (Edit Mode Only) */}
                            {isEditing && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Status</h4>
                                    <Select
                                        value={formData?.status}
                                        onValueChange={(val: any) => setFormData((prev) => (prev ? { ...prev, status: val } : null))}
                                    >
                                        <SelectTrigger className="bg-white h-12 rounded-2xl border-gray-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Review Content Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                                    Review
                                </h4>
                                <div className="bg-white rounded-2xl shadow-sm p-4">
                                    {isEditing ? (
                                        <Textarea
                                            value={formData?.comment || ""}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => (prev ? { ...prev, comment: e.target.value } : null))}
                                            className="min-h-[150px] border-0 focus-visible:ring-0 p-0 text-[15px] leading-relaxed resize-none shadow-none"
                                            placeholder="Review content..."
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">
                                            {review.comment}
                                        </p>
                                    )}
                                    {!isEditing && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Images Section with Edit Mode */}
                            {(isEditing ? currentImages.length > 0 : images.length > 0) && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                                        Photos ({isEditing ? currentImages.length : images.length})
                                        {isEditing && <span className="text-red-500 ml-2">Click X to remove</span>}
                                    </h4>
                                    <div className="bg-white rounded-2xl shadow-sm p-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            {(isEditing ? currentImages : images).map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                    <img
                                                        src={img}
                                                        alt={`Review photo ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {isEditing ? (
                                                        // Red X button to remove image
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                                                            title="Remove this image"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        // Lightbox click in view mode
                                                        <button
                                                            type="button"
                                                            onClick={() => openLightbox(images, idx)}
                                                            className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {isEditing && currentImages.length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-4">All images removed</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed Footer with Actions */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4">
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={handleCancel} className="h-12 rounded-xl border-gray-200">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="h-12 rounded-xl bg-black text-white hover:bg-zinc-800">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {review.status !== "approved" && (
                                    <Button
                                        onClick={() => {
                                            onApprove?.(review.id)
                                            // Keeping drawer open might be nice, but stick to existing behavior
                                            onClose()
                                        }}
                                        className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                )}
                                {review.status !== "rejected" && review.status !== "approved" && (
                                    <Button
                                        onClick={() => {
                                            onReject?.(review.id)
                                            onClose()
                                        }}
                                        variant="outline"
                                        className="rounded-xl h-12 border-amber-200 text-amber-700 hover:bg-amber-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                )}
                                <Button
                                    onClick={() => {
                                        onDelete?.(review.id)
                                        onClose()
                                    }}
                                    variant="outline"
                                    className={cn(
                                        "rounded-xl h-12 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200",
                                        review.status === "approved" && "col-span-3"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0">
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
                                    onClick={() =>
                                        setLightboxIndex(
                                            (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
                                        )
                                    }
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-6 w-6 rotate-90" />
                                </button>
                                <button
                                    onClick={() => setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-6 w-6 -rotate-90" />
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
        </>
    )
}
