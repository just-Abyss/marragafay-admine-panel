"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockActivities } from "@/lib/mock-data"
import type { Activity } from "@/lib/types"
import { Loader2, Edit, Clock, DollarSign, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ActivitiesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleToggleActive = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a)))
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity({ ...activity })
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    if (editingActivity) {
      setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? editingActivity : a)))
      setEditDialogOpen(false)
      setEditingActivity(null)
    }
  }

  if (isLoading || !user) {
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
          <p className="text-muted-foreground mt-1">Manage your desert experience activities</p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {activities.map((activity, i) => (
            <GlassCard
              key={activity.id}
              hover
              className={cn("relative transition-all duration-200", !activity.is_active && "opacity-60")}
              style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute top-4 right-4 w-3 h-3 rounded-full",
                  activity.is_active ? "bg-emerald-500" : "bg-slate-300",
                )}
              />

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{activity.price.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{activity.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Switch checked={activity.is_active} onCheckedChange={() => handleToggleActive(activity.id)} />
                    <span className="text-sm text-muted-foreground">{activity.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => handleEdit(activity)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass border border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Activity</DialogTitle>
          </DialogHeader>

          {editingActivity && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingActivity.description}
                  onChange={(e) =>
                    setEditingActivity((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (MAD)</Label>
                  <Input
                    type="number"
                    value={editingActivity.price}
                    onChange={(e) =>
                      setEditingActivity((prev) =>
                        prev ? { ...prev, price: Number.parseInt(e.target.value) || 0 } : null,
                      )
                    }
                    className="rounded-xl border-0 bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={editingActivity.duration}
                    onChange={(e) =>
                      setEditingActivity((prev) => (prev ? { ...prev, duration: e.target.value } : null))
                    }
                    className="rounded-xl border-0 bg-secondary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-xl bg-[#C19B76] hover:bg-[#A67C52]" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl bg-transparent"
                  onClick={() => setEditDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
