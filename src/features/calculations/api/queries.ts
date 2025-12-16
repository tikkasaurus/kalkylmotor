import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { 
  BookkeepingAccountResponse,
  Calculation, 
  CopyCostEstimateResponse, 
  CostEstimateResponse, 
  CreateCalculationRequest, 
  GetCalculationsReponse, 
  InitializeCostEstimateResponse, 
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ costEstimateId, templateName }: { costEstimateId: number; templateName: string }) =>
      apiClient.put(`/CostEstimate/${costEstimateId}/toTemplate?templateName=${templateName}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

export function useGetTenantIcon() {
  return useQuery({
    queryKey: ['tenant-icon'],
    queryFn: async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const { tokenProvider } = await import('@/lib/tokenProvider')
      const token = await tokenProvider.getAccessToken()
      
      const headers: HeadersInit = {
        'Accept': 'image/png,image/*,*/*',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const url = `${API_BASE_URL}/CostEstimate/tenant/icon`
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tenant icon: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    },
  })
}

export function useDeleteCostEstimate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (costEstimateId: number) =>
      apiClient.delete(`/CostEstimate/${costEstimateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
    },
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

export function useInitializeCostEstimate() {
  return useMutation({
    mutationFn: () =>
      apiClient.post<InitializeCostEstimateResponse>(`/CostEstimate/init`),
  })
}

export function useCopyCostEstimate() {
  return useMutation({
    mutationFn: (costEstimateId: number) =>
      apiClient.put<CopyCostEstimateResponse>(`/CostEstimate/${costEstimateId}/copy`, {}),
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
    queryFn: async () => {
      const res = await apiClient.get<BookkeepingAccountResponse>(`/CostEstimate/bookkeeping-accounts`)
      return res.data.map((account) => ({
        id: account.accountNo,
        accountNumber: account.accountNo,
        description: account.name,
      }))
    }
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

export function useConnectCostEstimateToProject() {
  return useMutation({
    mutationFn: ({ costEstimateId, projectId }: { costEstimateId: number; projectId: number }) =>
      apiClient.post(`/CostEstimate/${costEstimateId}/projects/${projectId}?budgetType=Production`, {}),
  })
}
