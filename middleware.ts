import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value)
                        res.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Protect /dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            // Redirect to login page
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/'
            return NextResponse.redirect(redirectUrl)
        }
    }

    // If user is logged in and tries to access login page, redirect to dashboard
    if (req.nextUrl.pathname === '/' && session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: ['/', '/dashboard/:path*']
}
