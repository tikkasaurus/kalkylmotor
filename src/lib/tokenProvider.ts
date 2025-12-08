import type { PublicClientApplication, AccountInfo } from '@azure/msal-browser'
import { apiRequest } from '@/authConfig'

/**
 * Token provider for API client
 * Allows non-React code to access MSAL tokens
 */
class TokenProvider {
  private msalInstance: PublicClientApplication | null = null
  private currentAccount: AccountInfo | null = null

  /**
   * Initialize the token provider with MSAL instance
   */
  setMsalInstance(instance: PublicClientApplication) {
    this.msalInstance = instance
  }

  /**
   * Set the current account
   */
  setAccount(account: AccountInfo | null) {
    this.currentAccount = account
  }

  /**
   * Get access token for API calls
   * Uses silent token acquisition first, falls back to interactive if needed
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.msalInstance || !this.currentAccount) {
      return null
    }

    try {
      // Try to acquire token silently first
      const response = await this.msalInstance.acquireTokenSilent({
        ...apiRequest,
        account: this.currentAccount,
      })
      return response.accessToken
    } catch (error: unknown) {
      // If silent acquisition fails, try interactive redirect
      console.warn('Silent token acquisition failed, attempting interactive:', error)
      
      try {
        // For API calls, we'll use redirect to get consent if needed
        await this.msalInstance.acquireTokenRedirect({
          ...apiRequest,
          account: this.currentAccount,
        })
        return null // Will redirect, so return null
      } catch (redirectError) {
        console.error('Token acquisition failed:', redirectError)
        return null
      }
    }
  }
}

// Export singleton instance
export const tokenProvider = new TokenProvider()

