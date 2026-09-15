'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import XOLoader from '@/components/XOLoader'

/**
 * Route-loading feedback, in two stages.
 *
 *  1. Immediately: a slim top progress bar. Non-blocking, so the page you're
 *     leaving stays on screen and the transition still reads as movement.
 *  2. Only if the route is still loading after OVERLAY_DELAY: the branded
 *     matriXO loader fades in over the page.
 *
 * The delay is the important part. The old root `app/loading.tsx` replaced the
 * page subtree instantly on every navigation, blanking the viewport even for
 * fast routes - which is what made transitions pop. Holding the overlay back
 * means quick navigations never flash a loader at all, and slow ones still get
 * a proper branded state instead of an apparently frozen page.
 *
 * Next 14 has no navigation-start event (`useLinkStatus` landed in 15.3), so
 * we start on a same-origin link click and finish when the pathname changes.
 */

const OVERLAY_DELAY = 400

export default function NavigationProgress() {
    const pathname = usePathname()
    const [pending, setPending] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showOverlay, setShowOverlay] = useState(false)
    const timers = useRef<ReturnType<typeof setTimeout>[]>([])

    const clearTimers = useCallback(() => {
        timers.current.forEach(clearTimeout)
        timers.current = []
    }, [])

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            // Modified clicks open a new tab - this page isn't going anywhere.
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

            const anchor = (e.target as HTMLElement | null)?.closest('a')
            if (!anchor) return

            const href = anchor.getAttribute('href')
            if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return

            let url: URL
            try {
                url = new URL(anchor.href, window.location.href)
            } catch {
                return
            }
            if (url.origin !== window.location.origin) return
            if (url.pathname === window.location.pathname) return

            clearTimers()
            setPending(true)
            setShowOverlay(false)
            setProgress(0)

            // Creep toward 90%; the last 10% lands when the route resolves.
            timers.current.push(setTimeout(() => setProgress(35), 50))
            timers.current.push(setTimeout(() => setProgress(65), 250))
            timers.current.push(setTimeout(() => setProgress(85), 700))
            timers.current.push(setTimeout(() => setShowOverlay(true), OVERLAY_DELAY))
        }

        document.addEventListener('click', onClick, { capture: true })
        return () => {
            document.removeEventListener('click', onClick, { capture: true })
            clearTimers()
        }
    }, [clearTimers])

    // Pathname changed => the new route is rendering. Finish and clear.
    useEffect(() => {
        if (!pending) return
        clearTimers()
        setProgress(100)
        setShowOverlay(false)
        timers.current.push(
            setTimeout(() => {
                setPending(false)
                setProgress(0)
            }, 220)
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    if (!pending) return null

    return (
        <>
            <div
                className="fixed inset-x-0 top-0 z-[2000] h-0.5 pointer-events-none"
                role="progressbar"
                aria-label="Loading page"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                <div
                    className="h-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                    style={{
                        width: `${progress}%`,
                        transition: 'width 200ms ease-out, opacity 200ms ease-out',
                        opacity: progress >= 100 ? 0 : 1,
                    }}
                />
            </div>

            {showOverlay && (
                <div className="fixed inset-0 z-[1999] grid place-items-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm hero-fade">
                    <XOLoader size={20} />
                </div>
            )}
        </>
    )
}
