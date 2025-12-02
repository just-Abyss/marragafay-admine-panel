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
import type { Activity } from "@/lib/types"
import { Loader2, Edit, Clock, DollarSign, Save, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ActivitiesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    price: 0,
    duration: "",
  })
  const [loading, setLoading] = useState(true)

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
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error

      if (data) {
        setActivities(data)
      }
    } catch (error) {
      console.error('Supabase Error:', (error as any).message || error)
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))

      toast({
        title: "Status Updated",
        description: `Activity status has been updated.`,
      })
    } catch (error) {
      console.error('Supabase Error:', (error as any).message || error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity({ ...activity })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (editingActivity) {
      try {
        const { error } = await supabase
          .from('activities')
          .update({
            title: editingActivity.title,
            description: editingActivity.description,
            price: editingActivity.price,
            duration: editingActivity.duration,
          })
          .eq('id', editingActivity.id)

        if (error) throw error

        setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? editingActivity : a)))
        setEditDialogOpen(false)
        setEditingActivity(null)

        toast({
          title: "Activity Updated",
          description: `${editingActivity.title} has been updated successfully.`,
        })
      } catch (error) {
        console.error('Supabase Error:', (error as any).message || error)
        toast({
          title: "Error",
          description: "Failed to update activity",
          variant: "destructive",
        })
      }
    }
  }

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          title: newActivity.title,
          description: newActivity.description,
          price: newActivity.price,
          duration: newActivity.duration,
          active: true
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setActivities((prev) => [...prev, data])
        setCreateDialogOpen(false)
        setNewActivity({
          title: "",
          description: "",
          price: 0,
          duration: "",
        })

        toast({
          title: "Activity Created",
          description: `${newActivity.title} has been created successfully.`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Supabase Error:', (error as any).message || error)
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      })
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
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Activities</h1>
            <p className="text-muted-foreground mt-1">Manage your desert experience activities</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="rounded-xl bg-[#C19B76] hover:bg-[#A67C52]">
            <Plus className="w-4 h-4 mr-2" />
            New Activity
          </Button>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {activities.map((activity, i) => (
            <GlassCard
              key={activity.id}
              hover
              className={cn("relative transition-all duration-200", !activity.active && "opacity-60")}
              style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "absolute top-4 right-4 w-3 h-3 rounded-full",
                  activity.active ? "bg-emerald-500" : "bg-slate-300",
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
                    <Switch checked={activity.active} onCheckedChange={() => handleToggleActive(activity.id, activity.active)} />
                    <span className="text-sm text-muted-foreground">{activity.active ? "Active" : "Inactive"}</span>
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="glass border border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">New Activity</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Sunset Yoga"
                className="rounded-xl border-0 bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newActivity.description}
                onChange={(e) => setNewActivity((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                className="rounded-xl border-0 bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (MAD)</Label>
                <Input
                  type="number"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 2 hours"
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1 rounded-xl bg-[#C19B76] hover:bg-[#A67C52]" onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Activity
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-transparent"
                onClick={() => setCreateDialogOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                        prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null,
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
