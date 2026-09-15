type XOLoaderProps = {
    /** Root font-size for the mark; everything scales from it. */
    size?: number
    /** Visible caption under the mark. Omit for a bare spinner. */
    label?: string
    className?: string
}

/**
 * The matriXO loading mark: the X holds centre, the O laps around it, tucks in
 * to spell "XO", holds, then laps again. Styles live in globals.css under
 * `.xo-loader` so the animation runs from CSS alone — no JS, so it keeps
 * animating smoothly even while the main thread is busy loading a route.
 */
export default function XOLoader({ size = 16, label, className = '' }: XOLoaderProps) {
    return (
        <div className={`flex flex-col items-center gap-4 ${className}`} role="status" aria-live="polite">
            <div className="xo-loader font-display" style={{ fontSize: `${size}px` }}>
                <span className="xo-glyph xo-x" aria-hidden="true">X</span>
                <span className="xo-glyph xo-o" aria-hidden="true">O</span>
            </div>

            {label && (
                <p className="font-display text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                </p>
            )}
            <span className="sr-only">Loading…</span>
        </div>
    )
}
