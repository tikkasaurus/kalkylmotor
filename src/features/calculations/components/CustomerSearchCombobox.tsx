import { useState, useEffect } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { useCustomerSearch } from '@/features/calculations/api/queries'
import type { Customer } from '@/features/calculations/api/types'

interface CustomerSearchComboboxProps {
  value?: Customer | null
  onChange: (customer: Customer | null) => void
}

export function CustomerSearchCombobox({ value, onChange }: CustomerSearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useCustomerSearch(searchTerm)

  // Clear search when a value is selected
  useEffect(() => {
    if (value && searchTerm) {
      setSearchTerm('')
    }
  }, [value, searchTerm])

  const formatCustomerLabel = (customer: Customer): string => {
    if (customer.organizationNo) {
      return `${customer.name} (Org nr: ${customer.organizationNo})`
    }
    return customer.name
  }

  return (
    <Combobox<Customer>
      value={value}
      onValueChange={onChange}
      options={data?.data || []}
      getOptionLabel={formatCustomerLabel}
      getOptionKey={(customer) => customer.id}
      placeholder="Sök kund..."
      emptyText={searchTerm.length < 2 ? "Skriv minst 2 tecken för att söka" : "Inga kunder hittades"}
      isLoading={isLoading}
      onSearchChange={setSearchTerm}
      searchValue={searchTerm}
    />
  )
}
