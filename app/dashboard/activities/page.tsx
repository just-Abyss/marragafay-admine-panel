"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Activity } from "@/lib/types"
import { Loader2, Edit, Clock, DollarSign, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ActivitiesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ price: number; duration: string }>({
    price: 0,
    duration: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      // Fetch from pricing table with type = 'activity'
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('type', 'activity')
        .order('price', { ascending: true })

      if (error) throw error

      if (data) {
        // Map pricing data to Activity interface
        const mappedActivities: Activity[] = data.map((item) => ({
          id: item.id,
          title: item.name,                    // ✅ Using 'name' from database
          description: item.description || '',
          price: item.price,
          duration: item.duration || '2 hours',
          active: true,
          resource_type: 'none',
          capacity_per_session: 10
        }))
        setActivities(mappedActivities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing')
        .update({ active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setActivities((prev) =>
        prev.map((activity) => (activity.id === id ? { ...activity, active: !currentStatus } : activity)),
      )

      toast.success('Activity status updated')
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity status')
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditValues({ price: activity.price, duration: activity.duration })
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('pricing')
        .update({
          price: editValues.price,
          duration: editValues.duration
        })
        .eq('id', editingId)

      if (error) throw error

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === editingId
            ? { ...activity, price: editValues.price, duration: editValues.duration }
            : activity,
        ),
      )

      setEditingId(null)
      toast.success('Activity updated successfully')
    } catch (error) {
      console.error('Error saving activity:', error)
      toast.error('Failed to save activity')
    }
  }

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19B76]" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Activities</h1>
          <p className="text-muted-foreground mt-1">Manage individual activity offerings</p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {activities.map((activity) => {
            const isEditing = editingId === activity.id

            return (
              <GlassCard
                key={activity.id}
                className={cn(
                  "relative transition-all duration-300",
                  !activity.active && "opacity-60",
                )}
              >
                <div className="space-y-4">
                  {/* Activity Name */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <DollarSign className="w-5 h-5 text-[#C19B76]" />
                        <Input
                          type="number"
                          value={editValues.price}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-28 text-xl font-semibold rounded-xl"
                        />
                        <span className="text-muted-foreground text-sm">MAD / person</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 text-[#C19B76]" />
                        <span className="text-2xl font-semibold">{activity.price.toLocaleString()} MAD</span>
                        <span className="text-muted-foreground text-sm">/ person</span>
                      </>
                    )}
                  </div>

                  {/* Duration Section */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Clock className="w-5 h-5 text-[#C19B76]" />
                        <Input
                          value={editValues.duration}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, duration: e.target.value }))}
                          className="flex-1 rounded-xl"
                          placeholder="e.g., 2 hours"
                        />
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-[#C19B76]" />
                        <span className="text-muted-foreground">{activity.duration}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={activity.active}
                        onCheckedChange={() => handleToggleActive(activity.id, activity.active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {activity.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-xl bg-[#C19B76] hover:bg-[#A67C52]"
                          onClick={handleSave}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl bg-transparent"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities available. Please add activities to your pricing table.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
