import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { 
  BookkeepingAccountResponse,
  Calculation, 
  CO2Response, 
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
        description: undefined,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      // Invalidate the calculation detail cache so reopening the same calc fetches updated data
      // but don't refetch while the calculation view is open (keeps expand/collapse state)
      queryClient.invalidateQueries({
        queryKey: ['calculation', variables.costEstimateId],
        refetchType: 'inactive',
      })
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
    queryFn: async () => {
      const res = await apiClient.get<CO2Response>("/CostEstimate/co2")
      return res.data.map((co2) => ({
        id: co2.id,
        name: co2.name,
        category: co2.categoryName,
        co2Value: co2.value,
        unit: co2.unitTypeName,
      }))
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
