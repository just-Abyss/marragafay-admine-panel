"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
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
import { Check, X, Loader2, Star } from "lucide-react"

export function ReviewManager() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchReviews = async () => {
        try {
            // Don't set loading to true on refresh to avoid flicker, only on initial mount if wanted
            // But strictly speaking, for "real-time updating", we might just want to refresh data
            if (reviews.length === 0) setLoading(true)

            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setReviews(data || [])
        } catch (error) {
            console.error("Error fetching reviews:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
        try {
            setProcessingId(id)
            const { error } = await supabase
                .from("reviews")
                .update({ status: newStatus })
                .eq("id", id)

            if (error) throw error

            await fetchReviews()
            toast.success(`Review ${newStatus} successfully`)
        } catch (error) {
            console.error("Error updating review:", error)
            toast.error("Failed to update review status")
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="w-[40%]">Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">{review.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                {review.rating}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{review.comment}</TableCell>
                                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                                    onClick={() => updateStatus(review.id, "approved")}
                                                    disabled={processingId === review.id || review.status === "approved"}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                                    onClick={() => updateStatus(review.id, "rejected")}
                                                    disabled={processingId === review.id || review.status === "rejected"}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reviews.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No reviews found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
