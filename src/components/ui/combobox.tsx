import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ComboboxProps<T> {
  value?: T | null
  onValueChange: (value: T | null) => void
  options: T[]
  getOptionLabel: (option: T) => string
  getOptionKey: (option: T) => string | number
  placeholder?: string
  emptyText?: string
  isLoading?: boolean
  onSearchChange?: (search: string) => void
  searchValue?: string
}

export function Combobox<T>({
  value,
  onValueChange,
  options,
  getOptionLabel,
  getOptionKey,
  placeholder = "Search...",
  emptyText = "No results found.",
  isLoading = false,
  onSearchChange,
  searchValue = "",
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalSearch, setInternalSearch] = React.useState(searchValue)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const search = onSearchChange !== undefined ? searchValue : internalSearch
  const setSearch = onSearchChange !== undefined ? onSearchChange : setInternalSearch

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option: T) => {
    onValueChange(option)
    setSearch("")
    setOpen(false)
  }

  const handleClear = () => {
    onValueChange(null)
    setSearch("")
    inputRef.current?.focus()
  }

  const displayValue = value ? getOptionLabel(value) : ""

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={value ? displayValue : placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className={cn(value && !search && "text-muted-foreground")}
          />
          {value && !search && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={getOptionKey(option)}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  {getOptionLabel(option)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
