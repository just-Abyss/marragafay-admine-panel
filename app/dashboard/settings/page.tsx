"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockResources } from "@/lib/mock-data"
import { toast } from "sonner"
import { getUserDisplayName, getUserInitials, getUserRole } from "@/lib/user-utils"
import type { Resource } from "@/lib/types"
import { Loader2, Camera, Bell, Shield, Building, User, Lock, Package } from "lucide-react"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [resources, setResources] = useState<Resource[]>(mockResources)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleResourceChange = (id: string, count: number) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, total_count: count } : r)))
  }

  const handleSaveResources = () => {
    toast.success("Resources saved successfully")
  }

  const handleSaveGeneral = () => {
    toast.success("Settings saved successfully")
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
      <div className="p-4 lg:p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="grid grid-cols-5 w-full max-w-xl bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
            <TabsTrigger
              value="general"
              className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
            >
              <Building className="w-4 h-4 mr-2 hidden sm:inline" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
            >
              <Package className="w-4 h-4 mr-2 hidden sm:inline" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
            >
              <User className="w-4 h-4 mr-2 hidden sm:inline" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
            >
              <Lock className="w-4 h-4 mr-2 hidden sm:inline" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none"
            >
              <Bell className="w-4 h-4 mr-2 hidden sm:inline" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* General Tab - Using solid variant */}
          <TabsContent value="general" className="mt-6 space-y-6">
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Agency Information</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Agency Name</Label>
                  <Input defaultValue="Marragafay" className="rounded-xl border border-slate-200 bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    defaultValue="contact@marragafay.com"
                    className="rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+212 524 123 456" className="rounded-xl border border-slate-200 bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#C19B76] flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">M</span>
                    </div>
                    <Button variant="outline" className="rounded-xl bg-white border-slate-200">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>

            <Button
              className="w-full rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20"
              onClick={handleSaveGeneral}
            >
              Save Changes
            </Button>
          </TabsContent>

          {/* Resources Tab - Using solid variant */}
          <TabsContent value="resources" className="mt-6 space-y-6">
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Resource Capacity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Define your total inventory. This drives availability calculations in the booking wizard.
              </p>

              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="font-medium capitalize">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">Total available units</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-white border-slate-200 h-10 w-10"
                        onClick={() => handleResourceChange(resource.id, Math.max(0, resource.total_count - 1))}
                      >
                        -
                      </Button>
                      <span className="text-2xl font-bold w-12 text-center">{resource.total_count}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl bg-white border-slate-200 h-10 w-10"
                        onClick={() => handleResourceChange(resource.id, resource.total_count + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <Button
              className="w-full rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20"
              onClick={handleSaveResources}
            >
              Save Resources
            </Button>
          </TabsContent>

          {/* Profile Tab - Using solid variant */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Admin Profile</h3>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-[#C19B76] text-white text-2xl">{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium text-lg">{getUserDisplayName(user)}</h4>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-[#C19B76] capitalize mt-1">{getUserRole(user)}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    defaultValue={user?.user_metadata?.full_name || getUserDisplayName(user)}
                    className="rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email || ''} className="rounded-xl border border-slate-200 bg-slate-50" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    defaultValue={user?.user_metadata?.phone || '+212 6XX XXX XXX'}
                    className="rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>
            </GlassCard>

            <Button className="w-full rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20">
              Update Profile
            </Button>
          </TabsContent>

          {/* Security Tab - Using solid variant */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Change Password</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    className="rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Session Info */}
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Session Information</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{user?.id?.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-medium">Account Type</p>
                    <p className="text-sm text-[#C19B76] capitalize">{getUserRole(user)}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <Button className="w-full rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20">
              Update Password
            </Button>
          </TabsContent>

          {/* Notifications Tab - Using solid variant */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <GlassCard variant="solid">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-[#C19B76]" />
                <h3 className="font-semibold text-lg">Notification Preferences</h3>
              </div>

              <div className="space-y-1">
                {[
                  { title: "Email Notifications", desc: "Receive booking updates via email", defaultChecked: true },
                  { title: "Push Notifications", desc: "Browser push for new inquiries", defaultChecked: true },
                  { title: "SMS Alerts", desc: "Text messages for urgent bookings", defaultChecked: false },
                  { title: "Daily Summary", desc: "Daily email digest of activity", defaultChecked: true },
                  { title: "Marketing Updates", desc: "News and feature announcements", defaultChecked: false },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <Button className="w-full rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20">
              Save Preferences
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
