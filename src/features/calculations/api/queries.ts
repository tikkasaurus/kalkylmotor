import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { 
  Calculation, 
  CostEstimateResponse, 
  CreateCalculationRequest, 
  GetCalculationsReponse, 
  ProjectsResponse, 
  UnitTypeResponse 
} from './types'

export function useCostEstimatesQuery() {
  return useQuery({
    queryKey: ['calculations'],
    queryFn: async () => {
      try {
        const data = await apiClient.get<CostEstimateResponse>('/CostEstimate')
        console.log('API response:', data)
        return data;
      } catch (error) {
        console.error('API error:', error)
        throw error
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useCreateTemplate() {
  return useMutation({
    mutationFn: (costEstimateId: number) =>
      apiClient.put(`/CostEstimate/${costEstimateId}/toTemplate`),
  })
}

export function useGetTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await apiClient.get<Calculation[]>(`/CostEstimate/template`)
      return res.map((template) => ({
        id: template.id,
        title: template.name,
        description: '',
        popular: false,
      }));
    }
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
  
  return useMutation<Calculation, unknown, { costEstimateId: string; data: CreateCalculationRequest }>({
    mutationFn: ({ costEstimateId, data }: { costEstimateId: string; data: CreateCalculationRequest }) =>
      apiClient.post<Calculation>(`/CostEstimate/${costEstimateId}/calculations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
    },
  })
}

/**
 * Fetch a calculation payload by cost estimate id
 * (same shape as the create body)
 */
export function useGetCalculation(costEstimateId: string) {
  return useQuery({
    queryKey: ['calculation', costEstimateId],
    queryFn: () =>
      apiClient.get<GetCalculationsReponse>(`/CostEstimate/${costEstimateId}/calculations`),
    enabled: !!costEstimateId,
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

export function useGetUnitTypes() {
  return useQuery({
    queryKey: ['unitTypes'],
    queryFn: async () => {
      const res = await apiClient.get<UnitTypeResponse>(`/CostEstimate/unitType?Take=200`)
      return res.data.map((unit) => ({
        id: unit.id,
        name: unit.name,
        shortName: unit.shortName,
      }))
    }
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
      //const res = await apiClient.get<CO2Response>("/CostEstimate/co2")
      return [
        { id: 1, name: 'Betong C30/37', category: 'Betong', co2Value: 125, unit: 'kg CO2/m³' },
        { id: 2, name: 'Betong C25/30', category: 'Betong', co2Value: 110, unit: 'kg CO2/m³' },
        { id: 3, name: 'Armering B500B', category: 'Stål', co2Value: 1850, unit: 'kg CO2/ton' },
        { id: 4, name: 'Konstruktionsstål S355', category: 'Stål', co2Value: 1920, unit: 'kg CO2/ton' },
        { id: 5, name: 'Träreglar 45x145', category: 'Trä', co2Value: 12, unit: 'kg CO2/m³' },
        { id: 6, name: 'Limträ GL30c', category: 'Trä', co2Value: 45, unit: 'kg CO2/m³' },
        { id: 7, name: 'Gips 13mm', category: 'Gips', co2Value: 6.5, unit: 'kg CO2/m³' },
        { id: 8, name: 'Mineralull 195mm', category: 'Isolering', co2Value: 8.2, unit: 'kg CO2/m³' },
        { id: 9, name: 'Tegel röd', category: 'Tegel', co2Value: 180, unit: 'kg CO2/1000 st' },
        { id: 10, name: 'Betongpannor', category: 'Tak', co2Value: 15, unit: 'kg CO2/m³' },
      ]
    },
  })
}

export function useGetBookkeepingAccounts() {
  return useQuery({
    queryKey: ['bookkeeping-accounts'],
    queryFn: () => apiClient.get<Calculation>(`/CostEstimate/bookkeeping-accounts`),
  })
}

export const useGetProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await apiClient.get<ProjectsResponse>(`/CostEstimate/projects`)
      return res.data.map((p) => ({
        id: p.id,
        name: p.name,
      }));
    }
  })
}


export const useGetAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => {
      return [
        { id: 1, accountNumber: '4010', description: 'Material' },
        { id: 2, accountNumber: '4020', description: 'Underentreprenörer' },
        { id: 3, accountNumber: '4030', description: 'Maskinhyror' },
        { id: 4, accountNumber: '4040', description: 'Transporter' },
        { id: 5, accountNumber: '4050', description: 'Arbetskostnader' },
        { id: 6, accountNumber: '4060', description: 'Övriga direkta kostnader' },
        { id: 7, accountNumber: '4070', description: 'Projektkostnader' },
        { id: 8, accountNumber: '4080', description: 'Resor och traktamenten' },
      ]
    },
  })
}

