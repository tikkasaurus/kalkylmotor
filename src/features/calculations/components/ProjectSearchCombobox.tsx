import { useState, useMemo, useCallback } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { useGetProjects } from '@/features/calculations/api/queries'

export interface Project {
  id: number
  name: string
}

interface ProjectSearchComboboxProps {
  value?: Project | null
  onChange: (project: Project | null) => void
}

export function ProjectSearchCombobox({ value, onChange }: ProjectSearchComboboxProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetProjects(search)

  const projects = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page =>
      page.data.map(p => ({ id: p.id, name: p.name }))
    )
  }, [data])

  const handleScrollEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Combobox<Project>
      value={value}
      onValueChange={onChange}
      options={projects}
      getOptionLabel={(project) => project.name}
      getOptionKey={(project) => project.id}
      placeholder="Välj projekt..."
      emptyText="Inga projekt hittades"
      isLoading={isLoading}
      onSearchChange={setSearch}
      searchValue={search}
      onScrollEnd={handleScrollEnd}
      isFetchingMore={isFetchingNextPage}
    />
  )
}
