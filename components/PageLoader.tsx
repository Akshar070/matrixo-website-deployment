import XOLoader from '@/components/XOLoader'

/**
 * Full-screen loading state, for Suspense boundaries where there is genuinely
 * nothing to show yet.
 *
 * Deliberately NOT wired up as a root `app/loading.tsx`: that replaces the
 * whole page subtree, so it blanked the viewport on every navigation and made
 * transitions pop. Route changes use the non-blanking NavigationProgress bar
 * instead; this is for real, content-less waits.
 */
export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-blue-950/20">
      <XOLoader size={20} label="matriXO" />
    </div>
  )
}
