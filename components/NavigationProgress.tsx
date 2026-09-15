'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * A slim progress bar shown while a route is loading.
 *
 * This replaces the old root `app/loading.tsx`, which rendered a full-screen
 * `min-h-screen` spinner. Because `loading.tsx` *replaces* the page subtree,
 * every navigation blanked the entire viewport before the next page animated
 * in - which is what made transitions feel like they popped rather than moved.
 * Without it, Next keeps the current page on screen until the next one is
 * ready, so this bar is the only thing that needs to indicate progress.
 *
 * Next 14 has no navigation-start event (`useLinkStatus` landed in 15.3), so
 * we start on a same-origin link click and finish when the pathname changes.
 */
export default function NavigationProgress() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const timers = useRef<ReturnType<typeof setTimeout>[]>([])

    const clearTimers = () => {
        timers.current.forEach(clearTimeout)
        timers.current = []
    }

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            // Ignore modified clicks - those open a new tab, the page doesn't change.
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

            const anchor = (e.target as HTMLElement | null)?.closest('a')
            if (!anchor) return

            const href = anchor.getAttribute('href')
            if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return

            // Only same-origin navigations to a different path.
            let url: URL
            try {
                url = new URL(anchor.href, window.location.href)
            } catch {
                return
            }
            if (url.origin !== window.location.origin) return
            if (url.pathname === window.location.pathname) return

            clearTimers()
            setVisible(true)
            setProgress(0)
            // Ease toward 90% - the remaining 10% lands when the route resolves,
            // so a slow route still looks like it's making progress.
            timers.current.push(setTimeout(() => setProgress(35), 50))
            timers.current.push(setTimeout(() => setProgress(65), 250))
            timers.current.push(setTimeout(() => setProgress(85), 700))
        }

        document.addEventListener('click', onClick, { capture: true })
        return () => {
            document.removeEventListener('click', onClick, { capture: true })
            clearTimers()
        }
    }, [])

    // Pathname changed => the new route is rendering. Finish and fade out.
    useEffect(() => {
        if (!visible) return
        clearTimers()
        setProgress(100)
        const t = setTimeout(() => {
            setVisible(false)
            setProgress(0)
        }, 220)
        timers.current.push(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    if (!visible) return null

    return (
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
                    // Transform-free width animation is fine here: the bar is 2px
                    // tall and composited on its own layer via the fixed position.
                    transition: 'width 200ms ease-out, opacity 200ms ease-out',
                    opacity: progress >= 100 ? 0 : 1,
                }}
            />
        </div>
    )
}
