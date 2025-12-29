"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Review } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, Edit, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface ReviewModerationTableProps {
    reviews: Review[]
    onRefresh: () => void
}

export function ReviewModerationTable({ reviews, onRefresh }: ReviewModerationTableProps) {
    const [editDialog, setEditDialog] = useState<{ open: boolean; review: Review | null }>({ open: false, review: null })
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
    const [formData, setFormData] = useState({ name: "", comment: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleApprove = async (id: string) => {
        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('reviews')
                .update({
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            if (error) throw error

            toast.success("Review approved! Now visible on the main site.", {
                icon: "✅"
            })
            onRefresh()
        } catch (error) {
            console.error('Error approving review:', error)
            toast.error("Failed to approve review")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async (id: string) => {
        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('reviews')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)

            if (error) throw error

            toast.success("Review rejected")
            onRefresh()
        } catch (error) {
            console.error('Error rejecting review:', error)
            toast.error("Failed to reject review")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        if (!editDialog.review || !formData.name || !formData.comment) {
            toast.error("Please fill all fields")
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('reviews')
                .update({
                    name: formData.name,
                    comment: formData.comment,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editDialog.review.id)

            if (error) throw error

            toast.success("Review updated successfully")
            setEditDialog({ open: false, review: null })
            onRefresh()
        } catch (error) {
            console.error('Error updating review:', error)
            toast.error("Failed to update review")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.id) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', deleteDialog.id)

            if (error) throw error

            toast.success("Review deleted successfully")
            setDeleteDialog({ open: false, id: null })
            onRefresh()
        } catch (error) {
            console.error('Error deleting review:', error)
            toast.error("Failed to delete review")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (review: Review) => {
        setFormData({
            name: review.name,
            comment: review.comment
        })
        setEditDialog({ open: true, review })
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Approved</Badge>
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Pending</Badge>
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Rejected</Badge>
            default:
                return null
        }
    }

    return (
        <>
            <GlassCard className="p-6">
                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="max-w-md">Comment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No reviews found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div>{review.name}</div>
                                                {review.email && (
                                                    <div className="text-xs text-muted-foreground">{review.email}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {renderStars(review.rating)}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="line-clamp-2 text-sm">
                                                {review.comment}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(review.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {review.status !== 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={isSubmitting}
                                                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleReject(review.id)}
                                                        disabled={isSubmitting}
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(review)}
                                                    className="h-8 w-8"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteDialog({ open: true, id: review.id })}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, review: null })}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>
                            Fix typos in the customer name or comment before approving.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Customer name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea
                                id="comment"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Review comment"
                                rows={5}
                            />
                        </div>
                        {editDialog.review && (
                            <div className="text-sm text-muted-foreground">
                                Rating: {renderStars(editDialog.review.rating)}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialog({ open: false, review: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                            className="bg-[#C19B76] hover:bg-[#A17D5F] text-white"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The review will be permanently removed from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
