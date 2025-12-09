import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react'
import { useCallback } from 'react'
import { loginRequest, apiRequest } from '@/authConfig'

/**
 * Custom hook for MSAL authentication
 * Provides authentication state and token acquisition functions
 */
export function useAuth() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const account = useAccount(accounts[0] || null)

  /**
   * Acquire access token for API calls
   * Uses silent token acquisition first, falls back to interactive if needed
   */
  const acquireToken = useCallback(async (): Promise<string | null> => {
    if (!account) {
      return null
    }

    try {
      // Try to acquire token silently first
      const response = await instance.acquireTokenSilent({
        ...apiRequest,
        account: account,
        forceRefresh: true,
      })
      return response.accessToken
    } catch (error: unknown) {
      // If silent acquisition fails, try interactive redirect
      console.warn('Silent token acquisition failed, attempting interactive:', error)
      
      try {
        // For API calls, we'll use redirect to get consent if needed
        // This will redirect the user to login if consent is required
        await instance.acquireTokenRedirect({
          ...apiRequest,
          account: account,
        })
        return null // Will redirect, so return null
      } catch (redirectError) {
        console.error('Token acquisition failed:', redirectError)
        return null
      }
    }
  }, [instance, account])

  /**
   * Redirect to login if not authenticated
   */
  const login = useCallback(() => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error('Login redirect failed:', error)
    })
  }, [instance])

  /**
   * Logout the current user
   */
  const logout = useCallback(() => {
    instance.logoutRedirect().catch((error) => {
      console.error('Logout redirect failed:', error)
    })
  }, [instance])

  return {
    isAuthenticated,
    account,
    acquireToken,
    login,
    logout,
    instance,
  }
}

