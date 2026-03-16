import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  BookkeepingAccountResponse,
  Calculation,
  CO2Response,
  CopyCostEstimateResponse,
  CostEstimateResponse,
  CreateCalculationRequest,
  CustomerSearchResponse,
  GetCalculationsReponse,
  InitializeCostEstimateRequest,
  InitializeCostEstimateResponse,
  ProjectsResponse,
  UnitTypeResponse
} from './types'

export function useCostEstimatesQuery(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['calculations', { projectId }] : ['calculations'],
    queryFn: async () => {
      try {
        const url = projectId
          ? `/CostEstimate?projectId=${encodeURIComponent(projectId)}`
          : '/CostEstimate'
        const data = await apiClient.get<CostEstimateResponse>(url)
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

  return useMutation<GetCalculationsReponse, unknown, { costEstimateId: string; data: CreateCalculationRequest }>({
    mutationFn: ({ costEstimateId, data }: { costEstimateId: string; data: CreateCalculationRequest }) =>
      apiClient.post<GetCalculationsReponse>(`/CostEstimate/${costEstimateId}/calculations`, data),
    onSuccess: (responseData, variables) => {
      queryClient.setQueryData(['calculation', variables.costEstimateId], responseData)
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
    mutationFn: (data?: InitializeCostEstimateRequest) =>
      apiClient.post<InitializeCostEstimateResponse>(`/CostEstimate/init`, data),
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
      const CACHE_KEY = 'bookkeeping-accounts-cache'
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data
        }
      }

      const TAKE = 500
      let allAccounts: Array<{ id: number; accountNumber: number; description: string }> = []
      let skip = 0

      // First request to get count
      const firstRes = await apiClient.get<BookkeepingAccountResponse>(`/CostEstimate/bookkeeping-accounts?Take=${TAKE}&Skip=${skip}&SortDesc=false&SortColumn=accountno&IncludeCount=true`)
      const totalCount = firstRes.count
      allAccounts = firstRes.data.map((account) => ({
        id: account.accountNo,
        accountNumber: account.accountNo,
        description: account.name,
      }))

      // Fetch remaining batches if count > skip + take
      while (totalCount > skip + TAKE) {
        skip += TAKE
        const res = await apiClient.get<BookkeepingAccountResponse>(`/CostEstimate/bookkeeping-accounts?Take=${TAKE}&Skip=${skip}&SortDesc=false&SortColumn=accountno&IncludeCount=false`)
        const batch = res.data.map((account) => ({
          id: account.accountNo,
          accountNumber: account.accountNo,
          description: account.name,
        }))
        allAccounts = [...allAccounts, ...batch]
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: allAccounts,
        timestamp: Date.now()
      }))

      return allAccounts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

const PROJECTS_PAGE_SIZE = 20

export const useGetProjects = (search: string = '') => {
  return useInfiniteQuery({
    queryKey: ['projects', search],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        Take: String(PROJECTS_PAGE_SIZE),
        Skip: String(pageParam),
        onlyActiveProject: 'true',
      })
      if (search) {
        params.set('Search', search)
      }
      const res = await apiClient.get<ProjectsResponse>(
        `/CostEstimate/projects?${params.toString()}`
      )
      return res
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0)
      return loaded < lastPage.count ? loaded : undefined
    },
  })
}

export function useConnectCostEstimateToProject() {
  return useMutation({
    mutationFn: ({ costEstimateId, projectId }: { costEstimateId: number; projectId: number }) =>
      apiClient.post(`/CostEstimate/${costEstimateId}/projects/${projectId}?budgetType=Production`, {}),
  })
}

export function useCustomerSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['customer-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return { count: 0, data: [] }
      }
      return await apiClient.get<CustomerSearchResponse>(
        `/CostEstimate/customer/search?Search=${encodeURIComponent(searchTerm)}`
      )
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  })
}
