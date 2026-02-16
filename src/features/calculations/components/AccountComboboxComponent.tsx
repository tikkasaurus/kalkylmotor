import * as React from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ComboboxProps<T> {
    value: T | null
    onValueChange: (value: T | null) => void
    options: T[]
    getOptionLabel: (option: T) => string
    getOptionKey: (option: T) => string | number
    placeholder?: string
    emptyText?: string
    isLoading?: boolean
    onSearchChange?: (value: string) => void
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
    const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})

    const search = onSearchChange !== undefined ? searchValue : internalSearch
    const setSearch = onSearchChange !== undefined ? onSearchChange : setInternalSearch

    // ✅ keep internalSearch in sync if parent changes searchValue
    React.useEffect(() => {
        if (onSearchChange === undefined) {
            setInternalSearch(searchValue)
        }
    }, [searchValue, onSearchChange])

    React.useEffect(() => {
        if (open && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            })
        }
    }, [open, search])

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

    React.useEffect(() => {
        if (!open) return

        const handleScroll = (event: Event) => {
            const target = event.target as Node | null

            if (
                (target && dropdownRef.current?.contains(target)) ||
                (target && inputRef.current?.contains(target))
            ) {
                return
            }

            setOpen(false)
        }

        window.addEventListener("scroll", handleScroll, true)
        return () => window.removeEventListener("scroll", handleScroll, true)
    }, [open])

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

            {open &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={dropdownStyle}
                        className="bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
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
                    </div>,
                    document.body
                )}
        </div>
    )
}

/** ✅ Account wrapper (the named export your table imports) */
interface Account {
    id: number
    accountNumber: number
    description: string
}

interface AccountComboboxProps {
    accounts: Account[]
    value: string // account number as string
    onChange: (value: string) => void
    isLoading?: boolean
}

export function AccountCombobox({
                                    accounts,
                                    value,
                                    onChange,
                                    isLoading,
                                }: AccountComboboxProps) {
    const [search, setSearch] = React.useState("")

    const selectedAccount = React.useMemo(
        () => accounts.find((a) => String(a.accountNumber) === value) ?? null,
        [accounts, value]
    )

    const filteredAccounts = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return accounts
        return accounts.filter(
            (a) =>
                String(a.accountNumber).includes(q) ||
                a.description.toLowerCase().includes(q)
        )
    }, [accounts, search])

    return (
        <Combobox<Account>
            value={selectedAccount}
            onValueChange={(account) => onChange(account ? String(account.accountNumber) : "")}
            options={filteredAccounts}
            getOptionLabel={(a) => `${a.accountNumber} - ${a.description}`}
            getOptionKey={(a) => a.id}
            placeholder="Sök konto..."
            emptyText="Inga konton hittades."
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
        />
    )
}
