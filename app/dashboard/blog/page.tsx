"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockBlogPosts } from "@/lib/mock-data"
import type { BlogPost } from "@/lib/types"
import { Loader2, Edit, Calendar, User, Save, X, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BlogPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post })
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? editingPost : p)))
      setEditDialogOpen(false)
      setEditingPost(null)
      toast.success("Post saved successfully")
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast.success("Post deleted successfully")
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Blog</h1>
            <p className="text-muted-foreground mt-1">Manage your blog posts and content</p>
          </div>
          <Button className="rounded-xl bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Blog Posts List */}
        <GlassCard className="animate-slide-up overflow-hidden">
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground hidden sm:table-cell">Author</th>
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 md:hidden mt-1">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => handleEdit(post)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass border border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Post</DialogTitle>
          </DialogHeader>

          {editingPost && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingPost.title}
                  onChange={(e) => setEditingPost((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost((prev) => (prev ? { ...prev, excerpt: e.target.value } : null))}
                  className="rounded-xl border-0 bg-secondary/50 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingPost.date}
                    onChange={(e) => setEditingPost((prev) => (prev ? { ...prev, date: e.target.value } : null))}
                    className="rounded-xl border-0 bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingPost.status}
                    onValueChange={(value: "published" | "draft") =>
                      setEditingPost((prev) => (prev ? { ...prev, status: value } : null))
                    }
                  >
                    <SelectTrigger className="rounded-xl border-0 bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
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
