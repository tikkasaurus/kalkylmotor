import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Calculation } from './types'

/**
 * Fetch all calculations
 */
export function useCalculationsQuery() {
  return useQuery({
    queryKey: ['calculations'],
    queryFn: async () => {
      try {
        const data = await apiClient.get<Calculation[]>('/calculations')
        console.log('API response:', data)
        return data
      } catch (error) {
        console.error('API error:', error)
        throw error
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch a single calculation
 */
export function useCalculationQuery(id: number) {
  return useQuery({
    queryKey: ['calculations', id],
    queryFn: () => apiClient.get<Calculation>(`/calculations/${id}`),
    enabled: !!id,
  })
}

/**
 * Create a new calculation
 */
export function useCreateCalculation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<Calculation>) => 
      apiClient.post<Calculation>('/calculations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
    },
  })
}

/**
 * Update an existing calculation
 */
export function useUpdateCalculation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Calculation> }) =>
      apiClient.put<Calculation>(`/calculations/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['calculations', id] })
    },
  })
}

/**
 * Delete a calculation
 */
export function useDeleteCalculation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/calculations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
    },
  })
}

export const useGetCO2Database = () => {
  return useQuery({
    queryKey: ['co2-database'],
    queryFn: () => {
      return [
        { id: 1, artikelnamn: 'Betong C30/37', kategori: 'Betong', co2Varde: 125, enhet: 'kg CO2/m³' },
        { id: 2, artikelnamn: 'Betong C25/30', kategori: 'Betong', co2Varde: 110, enhet: 'kg CO2/m³' },
        { id: 3, artikelnamn: 'Armering B500B', kategori: 'Stål', co2Varde: 1850, enhet: 'kg CO2/ton' },
        { id: 4, artikelnamn: 'Konstruktionsstål S355', kategori: 'Stål', co2Varde: 1920, enhet: 'kg CO2/ton' },
        { id: 5, artikelnamn: 'Träreglar 45x145', kategori: 'Trä', co2Varde: 12, enhet: 'kg CO2/m³' },
        { id: 6, artikelnamn: 'Limträ GL30c', kategori: 'Trä', co2Varde: 45, enhet: 'kg CO2/m³' },
        { id: 7, artikelnamn: 'Gips 13mm', kategori: 'Gips', co2Varde: 6.5, enhet: 'kg CO2/m³' },
        { id: 8, artikelnamn: 'Mineralull 195mm', kategori: 'Isolering', co2Varde: 8.2, enhet: 'kg CO2/m³' },
        { id: 9, artikelnamn: 'Tegel röd', kategori: 'Tegel', co2Varde: 180, enhet: 'kg CO2/1000 st' },
        { id: 10, artikelnamn: 'Betongpannor', kategori: 'Tak', co2Varde: 15, enhet: 'kg CO2/m³' },
      ]
    },
  })
}

