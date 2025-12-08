import { useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { InteractionStatus } from '@azure/msal-browser'
import { useMsal } from '@azure/msal-react'
import { tokenProvider } from '@/lib/tokenProvider'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Authentication Guard Component
 * Protects routes by ensuring user is authenticated
 * Automatically redirects to login if not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, login, account } = useAuth()
  const { inProgress } = useMsal()

  // Update token provider with current account
  useEffect(() => {
    if (account) {
      tokenProvider.setAccount(account)
    } else {
      tokenProvider.setAccount(null)
    }
  }, [account])

  useEffect(() => {
    // Wait for MSAL to finish initializing
    if (inProgress === InteractionStatus.None) {
      // If not authenticated and not currently processing a login, redirect to login
      if (!isAuthenticated) {
        login()
      }
    }
  }, [isAuthenticated, inProgress, login])

  // Show loading state while MSAL is initializing or processing authentication
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated, show loading (redirect is in progress)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  )
}

