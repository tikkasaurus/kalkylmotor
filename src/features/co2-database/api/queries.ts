/**
 * TanStack Query hooks for CO2 database
 * 
 * Example implementations for when the backend API is ready:
 */

// import { useQuery } from '@tanstack/react-query'
// import { apiClient } from '@/lib/api-client'

/**
 * CO2 Item type
 */
export interface CO2Item {
  id: number
  artikelnamn: string
  kategori: string
  co2Varde: number
  enhet: string
}

/**
 * Fetch all CO2 items
 * 
 * Actual implementation:
 * export function useCO2ItemsQuery(searchQuery?: string) {
 *   return useQuery({
 *     queryKey: ['co2-items', searchQuery],
 *     queryFn: () => apiClient.get<CO2Item[]>('/co2-items', {
 *       params: searchQuery ? { search: searchQuery } : undefined
 *     })
 *   })
 * }
 */

/**
 * Search CO2 items by query
 * 
 * Actual implementation:
 * export function useSearchCO2Items(query: string) {
 *   return useQuery({
 *     queryKey: ['co2-items', 'search', query],
 *     queryFn: () => apiClient.get<CO2Item[]>('/co2-items/search', {
 *       params: { q: query }
 *     }),
 *     enabled: query.length > 2 // Only search if query is at least 3 characters
 *   })
 * }
 */

