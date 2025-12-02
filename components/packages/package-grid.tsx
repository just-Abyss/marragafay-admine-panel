"use client"

import { useState } from "react"
import type { Package } from "@/lib/types"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Edit, Save, X, Crown, Star, Sparkles } from "lucide-react"

interface PackageGridProps {
  packages: Package[]
  onUpdate: (pkg: Package) => void
}

const tierIcons = {
  basic: Star,
  premium: Crown,
  vip: Sparkles,
}

const tierColors = {
  basic: "bg-slate-100 text-slate-700",
  premium: "bg-amber-100 text-amber-700",
  vip: "bg-[#C19B76]/20 text-[#C19B76]",
}

export function PackageGrid({ packages, onUpdate }: PackageGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ price: number }>({ price: 0 })

  const startEditing = (pkg: Package) => {
    setEditingId(pkg.id)
    setEditValues({ price: pkg.price })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues({ price: 0 })
  }

  const saveEditing = (pkg: Package) => {
    onUpdate({ ...pkg, price: editValues.price })
    setEditingId(null)
  }

  const toggleActive = (pkg: Package) => {
    onUpdate({ ...pkg, is_active: !pkg.is_active })
  }

  const getTier = (pkg: Package) => {
    if (pkg.tier) return pkg.tier
    const title = pkg.title.toLowerCase()
    if (title.includes("vip")) return "vip"
    if (title.includes("premium")) return "premium"
    return "basic"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => {
        const tier = getTier(pkg)
        const TierIcon = tierIcons[tier]
        const isEditing = editingId === pkg.id

        return (
          <GlassCard
            key={pkg.id}
            className={cn("relative overflow-hidden transition-all duration-300", !pkg.is_active && "opacity-60")}
          >
            {/* Tier Badge */}
            <div className="absolute top-4 right-4">
              <Badge className={cn("rounded-full", tierColors[tier])}>
                <TierIcon className="w-3 h-3 mr-1" />
                {tier.toUpperCase()}
              </Badge>
            </div>

            {/* Content */}
            <div className="pt-2">
              <h3 className="text-xl font-semibold mb-2">{pkg.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{pkg.description}</p>

              {/* Price */}
              <div className="mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editValues.price}
                      onChange={(e) => setEditValues({ price: Number(e.target.value) })}
                      className="w-24 text-2xl font-semibold rounded-xl"
                    />
                    <span className="text-muted-foreground">MAD / person</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">{pkg.price.toLocaleString()} MAD</span>
                    <span className="text-muted-foreground">/ person</span>
                  </div>
                )}
              </div>

              {/* Duration */}
              <p className="text-sm text-muted-foreground mb-4">Duration: {pkg.duration}</p>

              {/* Includes */}
              <div className="space-y-2 mb-6">
                {(pkg.includes && pkg.includes.length > 0) ? (
                  <>
                    {(pkg.includes || []).slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                    {(pkg.includes || []).length > 4 && (
                      <p className="text-sm text-muted-foreground pl-6">
                        +{(pkg.includes || []).length - 4} more
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                    <Check className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span>Includes basic amenities</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Switch checked={pkg.is_active} onCheckedChange={() => toggleActive(pkg)} />
                  <span className="text-sm text-muted-foreground">{pkg.is_active ? "Active" : "Inactive"}</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={cancelEditing}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#C19B76] hover:bg-[#A67C52]"
                      onClick={() => saveEditing(pkg)}
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
                    onClick={() => startEditing(pkg)}
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
  )
}
