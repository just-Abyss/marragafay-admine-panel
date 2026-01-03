"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Pricing } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"

interface PricingTableProps {
    pricing: Pricing[]
    onRefresh: () => void
}

export function PricingTable({ pricing, onRefresh }: PricingTableProps) {
    const [editDialog, setEditDialog] = useState<{ open: boolean; item: Pricing | null }>({ open: false, item: null })
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
    const [formData, setFormData] = useState({ activity_name: "", price: 0, currency: "MAD", duration: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreate = async () => {
        if (!formData.activity_name) {
            toast.error("Please fill all required fields")
            return
        }

        if (formData.price < 0) {
            toast.error("Price cannot be negative")
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('pricing')
                .insert([{
                    activity_name: formData.activity_name,
                    price: formData.price,
                    currency: formData.currency,
                    duration: formData.duration || null
                }])

            if (error) throw error

            toast.success("Activity pricing added successfully")
            setEditDialog({ open: false, item: null })
            setFormData({ activity_name: "", price: 0, currency: "MAD", duration: "" })
            onRefresh()
        } catch (error) {
            console.error('Error creating pricing:', error)
            toast.error("Failed to add pricing")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        if (!editDialog.item || !formData.activity_name) {
            toast.error("Please fill all required fields")
            return
        }

        if (formData.price < 0) {
            toast.error("Price cannot be negative")
            return
        }

        setIsSubmitting(true)
        try {
            // Prepare the payload (removed updated_at since column doesn't exist)
            const payload = {
                activity_name: formData.activity_name,
                price: Number(formData.price),
                currency: formData.currency,
                duration: formData.duration || null
            }

            console.log("🚀 Updating pricing ID:", editDialog.item.id)
            console.log("📦 Payload:", payload)

            const { error } = await supabase
                .from('pricing')
                .update(payload)
                .eq('id', editDialog.item.id)

            if (error) {
                console.log("❌ Supabase Error:", JSON.stringify(error, null, 2))
                throw error
            }

            console.log("✅ Update successful!")
            toast.success("Pricing updated successfully - live on the main site now!")
            setEditDialog({ open: false, item: null })
            onRefresh()
        } catch (error: any) {
            console.error('Error updating pricing:', error)
            toast.error("Failed to update pricing")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.id) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('pricing')
                .delete()
                .eq('id', deleteDialog.id)

            if (error) throw error

            toast.success("Pricing deleted successfully")
            setDeleteDialog({ open: false, id: null })
            onRefresh()
        } catch (error) {
            console.error('Error deleting pricing:', error)
            toast.error("Failed to delete pricing")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (item: Pricing) => {
        setFormData({
            activity_name: item.activity_name,
            price: item.price,
            currency: item.currency,
            duration: item.duration || ""
        })
        setEditDialog({ open: true, item })
    }

    const openCreateDialog = () => {
        setFormData({ activity_name: "", price: 0, currency: "MAD", duration: "" })
        setEditDialog({ open: true, item: null })
    }

    return (
        <>
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Activity Pricing</h2>
                    <Button
                        onClick={openCreateDialog}
                        data-action="add-pricing"
                        className="bg-[#C19B76] hover:bg-[#A17D5F] text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                    </Button>
                </div>

                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pricing.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No pricing entries found. Add your first activity pricing.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pricing.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.activity_name}</TableCell>
                                        <TableCell>
                                            {item.price} {item.currency}
                                        </TableCell>
                                        <TableCell>{item.duration || "—"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(item)}
                                                    className="h-8 w-8"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteDialog({ open: true, id: item.id })}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
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

            {/* Edit/Create Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, item: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editDialog.item ? "Edit Pricing" : "Add New Activity"}</DialogTitle>
                        <DialogDescription>
                            {editDialog.item
                                ? "Update the pricing for this activity. Changes will be live immediately."
                                : "Add a new activity with pricing."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="activity_name">Activity Name *</Label>
                            <Input
                                id="activity_name"
                                value={formData.activity_name}
                                onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
                                placeholder="e.g., Quad Biking"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (MAD) *</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                placeholder="e.g., 350"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (Optional)</Label>
                            <Input
                                id="duration"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g., 2 hours"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialog({ open: false, item: null })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => editDialog.item ? handleUpdate() : handleCreate()}
                            disabled={isSubmitting}
                            className="bg-[#C19B76] hover:bg-[#A17D5F] text-white"
                        >
                            {isSubmitting ? "Saving..." : editDialog.item ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pricing entry.
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
