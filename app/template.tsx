'use client'

import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

// Ordered routes matching navbar tab positions, so moving "right" along the nav
// slides content in from the right, and vice versa.
const routeOrder = [
    '/',
    '/events',
    '/services',
    '/about',
    '/team',
    '/contact',
    '/careers',
    // Beta features (positioned after main nav)
    '/growgrid',
    '/playcred',
    '/mentormatrix',
    '/impactvault',
    '/profile',
]

function getRouteIndex(pathname: string): number {
    const exact = routeOrder.indexOf(pathname)
    if (exact !== -1) return exact
    for (let i = routeOrder.length - 1; i >= 0; i--) {
        if (routeOrder[i] !== '/' && pathname.startsWith(routeOrder[i])) return i
    }
    return Math.floor(routeOrder.length / 2)
}

// Persists across template remounts (this component is re-mounted on every
// navigation by design, so component state would be lost).
let prevRouteIndex = -1

const SLIDE_DISTANCE = 28

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const reduceMotion = useReducedMotion()
    const currIndex = getRouteIndex(pathname)

    // The first paint of the session is not a transition, it's the page loading.
    // Animating it from opacity:0 would hold the LCP element invisible until
    // hydration - which is exactly the "element render delay" the Lighthouse
    // report flagged. So the very first render is painted as-is, and only
    // subsequent navigations animate.
    const isFirstRender = useRef(prevRouteIndex === -1)

    let direction = 0
    if (prevRouteIndex !== -1 && prevRouteIndex !== currIndex) {
        direction = currIndex > prevRouteIndex ? 1 : -1
    }

    useEffect(() => {
        prevRouteIndex = currIndex
    }, [currIndex])

    if (isFirstRender.current || reduceMotion) {
        return <>{children}</>
    }

    return (
        <motion.div
            key={pathname}
            initial={{ x: direction * SLIDE_DISTANCE, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
                // Tuned so movement leads and opacity resolves early: the page
                // reads as sliding into place rather than fading up in one lump.
                x: { type: 'spring', stiffness: 320, damping: 34, mass: 0.6 },
                opacity: { duration: 0.18, ease: 'easeOut' },
            }}
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    )
}
