'use client'

import { useEffect } from 'react'

/**
 * Gives every `.cta-glass` button the home-page hover: the gradient sweeps in
 * from whichever side the cursor entered.
 *
 * One delegated listener rather than an onMouseEnter prop on each button —
 * there are ~40 of them across the app, and threading a handler through every
 * one would mean touching every file that renders a CTA. This stays in sync
 * automatically as buttons are added.
 */
export default function CtaDirection() {
    useEffect(() => {
        const onOver = (e: MouseEvent) => {
            const el = (e.target as HTMLElement | null)?.closest?.('.cta-glass') as HTMLElement | null
            if (!el) return

            // Re-reading on every enter keeps it correct after layout shifts.
            const rect = el.getBoundingClientRect()
            if (!rect.width) return
            el.dataset.direction = e.clientX - rect.left < rect.width / 2 ? 'left' : 'right'
        }

        // Capture phase so it still fires for buttons that stop propagation.
        document.addEventListener('mouseover', onOver, true)
        return () => document.removeEventListener('mouseover', onOver, true)
    }, [])

    return null
}
