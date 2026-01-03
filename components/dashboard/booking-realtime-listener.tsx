"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

/**
 * BookingRealtimeListener
 * 
 * This component subscribes to Supabase Realtime changes on the `bookings` table.
 * It listens for INSERT and UPDATE events and displays toast notifications accordingly.
 * Also plays a notification sound for new bookings.
 * 
 * This component renders nothing visually - it only handles side effects.
 */
export function BookingRealtimeListener() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Pre-load the notification sound
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/notification.mp3')
            audioRef.current.volume = 0.5
            // Fallback to a public CDN if local file doesn't exist
            audioRef.current.onerror = () => {
                audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                audioRef.current!.volume = 0.5
            }
        }

        const channel = supabase
            .channel('booking-realtime-listener')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                },
                (payload) => {
                    // Handle New Booking (INSERT)
                    if (payload.eventType === 'INSERT') {
                        const newBooking = payload.new as any

                        // Play notification sound
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0
                            audioRef.current.play().catch((e) => {
                                console.log('Audio play blocked by browser policy:', e)
                            })
                        }

                        toast.success("🎉 New Booking Received!", {
                            description: `${newBooking.name || newBooking.customer_name || 'Guest'} booked ${newBooking.package_title || 'a package'} for ${new Date(newBooking.date || newBooking.booking_date || Date.now()).toLocaleDateString()}`,
                            action: {
                                label: "View",
                                onClick: () => router.push('/dashboard/bookings')
                            },
                            duration: 10000,
                        })
                    }

                    // Handle Booking Update (UPDATE)
                    else if (payload.eventType === 'UPDATE') {
                        const newBooking = payload.new as any
                        const oldBooking = payload.old as any

                        // Notify on cancellation
                        if (newBooking.status === 'cancelled' && oldBooking.status !== 'cancelled') {
                            toast.error("⚠️ Booking Cancelled", {
                                description: `Booking for ${newBooking.name || newBooking.customer_name || 'Guest'} has been cancelled.`,
                                duration: 8000,
                            })
                        }

                        // Notify on confirmation
                        else if (newBooking.status === 'confirmed' && oldBooking.status !== 'confirmed') {
                            toast.success("✅ Booking Confirmed", {
                                description: `Booking for ${newBooking.name || newBooking.customer_name || 'Guest'} is now confirmed.`,
                                duration: 6000,
                            })
                        }

                        // Notify on payment status change
                        if (newBooking.payment_status === 'paid' && oldBooking.payment_status !== 'paid') {
                            toast.success("💰 Payment Received", {
                                description: `Full payment received for ${newBooking.name || newBooking.customer_name || 'Guest'}'s booking.`,
                                duration: 6000,
                            })
                        }
                    }

                    // Handle Booking Deletion (DELETE)
                    else if (payload.eventType === 'DELETE') {
                        const oldBooking = payload.old as any
                        toast.info("🗑️ Booking Deleted", {
                            description: `A booking has been removed from the system.`,
                            duration: 5000,
                        })
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('📡 Realtime: Connected to bookings channel')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('📡 Realtime: Disconnecting from bookings channel')
            supabase.removeChannel(channel)
        }
    }, [router])

    // This component renders nothing - it's purely for side effects
    return null
}
