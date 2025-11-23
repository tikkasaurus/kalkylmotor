import type { Calculation } from './types'

// Sample data - will be replaced with actual API calls
export const sampleCalculations: Calculation[] = [
  {
    id: 1,
    name: 'Tosito, Nässjö: Centrallager Trafikverket',
    project: 'Marcus Test',
    status: 'Aktiv',
    amount: '217 475 390 kr',
    created: '2025-01-05',
    createdBy: 'Gustaf',
  },
  {
    id: 2,
    name: 'Industri Norrköping',
    revision: 'Rev 3',
    project: 'Industri Norrköping',
    status: 'Aktiv',
    amount: '145 890 000 kr',
    created: '2025-01-10',
    createdBy: 'Maria Johansson',
  },
  {
    id: 3,
    name: 'Villa Lindgren - Huvudkalkyl',
    project: 'Villa Lindgren',
    status: 'Aktiv',
    amount: '8 450 000 kr',
    created: '2025-01-03',
    createdBy: 'Anna Svensson',
  },
  {
    id: 4,
    name: 'Kontorsbyggnad AB - Anbud',
    project: 'Kontorsbyggnad',
    status: 'Aktiv',
    amount: '32 150 000 kr',
    created: '2024-12-20',
    createdBy: 'Erik Andersson',
  },
  {
    id: 5,
    name: 'Ombyggnad radhus',
    project: 'Radhus Malmö',
    status: 'Avslutad',
    amount: '4 225 000 kr',
    created: '2024-11-28',
    createdBy: 'Peter Nilsson',
  },
]

/**
 * TanStack Query hooks for calculations
 * 
 * These are currently returning sample data.
 * Uncomment the actual implementations when the backend API is ready.
 */

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { apiClient } from '@/lib/api-client'

/**
 * Fetch all calculations
 * 
 * Actual implementation:
 * export function useCalculationsQuery() {
 *   return useQuery({
 *     queryKey: ['calculations'],
 *     queryFn: () => apiClient.get<Calculation[]>('/calculations')
 *   })
 * }
 */
export function useCalculationsQuery() {
  // TODO: Replace with actual API call when backend is ready
  return { data: sampleCalculations, isLoading: false, error: null }
}

/**
 * Fetch a single calculation
 * 
 * Actual implementation:
 * export function useCalculationQuery(id: number) {
 *   return useQuery({
 *     queryKey: ['calculations', id],
 *     queryFn: () => apiClient.get<Calculation>(`/calculations/${id}`),
 *     enabled: !!id
 *   })
 * }
 */

/**
 * Create a new calculation
 * 
 * Actual implementation:
 * export function useCreateCalculation() {
 *   const queryClient = useQueryClient()
 *   
 *   return useMutation({
 *     mutationFn: (data: Partial<Calculation>) => 
 *       apiClient.post<Calculation>('/calculations', data),
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ['calculations'] })
 *     }
 *   })
 * }
 */

/**
 * Update an existing calculation
 * 
 * Actual implementation:
 * export function useUpdateCalculation() {
 *   const queryClient = useQueryClient()
 *   
 *   return useMutation({
 *     mutationFn: ({ id, data }: { id: number; data: Partial<Calculation> }) =>
 *       apiClient.put<Calculation>(`/calculations/${id}`, data),
 *     onSuccess: (_, { id }) => {
 *       queryClient.invalidateQueries({ queryKey: ['calculations'] })
 *       queryClient.invalidateQueries({ queryKey: ['calculations', id] })
 *     }
 *   })
 * }
 */

/**
 * Delete a calculation
 * 
 * Actual implementation:
 * export function useDeleteCalculation() {
 *   const queryClient = useQueryClient()
 *   
 *   return useMutation({
 *     mutationFn: (id: number) => apiClient.delete(`/calculations/${id}`),
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ['calculations'] })
 *     }
 *   })
 * }
 */

