/**
 * Utility functions for safely handling user data from Supabase Auth
 */

interface SupabaseUser {
    id: string
    email: string
    user_metadata?: {
        full_name?: string
        name?: string
        [key: string]: any
    }
    role?: string
}

/**
 * Get display name from Supabase user object
 * Priority: user_metadata.full_name > user_metadata.name > email prefix > 'Admin'
 */
export function getUserDisplayName(user: SupabaseUser | null | undefined): string {
    if (!user) return 'Admin'

    // Try user_metadata.full_name
    if (user.user_metadata?.full_name) {
        return user.user_metadata.full_name
    }

    // Try user_metadata.name
    if (user.user_metadata?.name) {
        return user.user_metadata.name
    }

    // Extract from email (part before @)
    if (user.email) {
        const emailPrefix = user.email.split('@')[0]
        // Capitalize first letter and replace dots/underscores with spaces
        return emailPrefix
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return 'Admin'
}

/**
 * Get first name from display name
 */
export function getUserFirstName(user: SupabaseUser | null | undefined): string {
    const fullName = getUserDisplayName(user)
    return fullName.split(' ')[0]
}

/**
 * Get initials from user object for avatar
 */
export function getUserInitials(user: SupabaseUser | null | undefined): string {
    if (!user) return 'A'

    const displayName = getUserDisplayName(user)
    const nameParts = displayName.split(' ')

    if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
    }

    return displayName.charAt(0).toUpperCase()
}

/**
 * Get user role with fallback
 */
export function getUserRole(user: SupabaseUser | null | undefined): string {
    if (!user) return 'admin'
    return user.role || user.user_metadata?.role || 'admin'
}
