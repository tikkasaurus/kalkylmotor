import {
  DiffOperation,
  type BudgetRowPayload,
  type CalculationRow,
  type CalculationSection,
  type CalculationSectionPayload,
  type CalculationSubsection,
  type CalculationSubSubsection,
  type OptionBudgetRowPayload,
  type OptionRow,
} from '@/features/calculations/api/types'

const parseAccountNo = (account: string): number => {
  if (!account || account === 'Välj konto') return 0
  const direct = Number(account)
  if (Number.isFinite(direct) && direct > 0) return direct
  const match = account.match(/^\s*(\d+)\s*-/)
  if (match) return Number(match[1])
  return 0
}

const rowAmount = (row: CalculationRow) => row.quantity * row.pricePerUnit * (1 + row.waste)

function rowMatchesOriginal(current: CalculationRow, original: BudgetRowPayload): boolean {
  return (
    parseAccountNo(current.account) === (original.accountNo || 0) &&
    current.description === original.name &&
    current.quantity === original.quantity &&
    current.pricePerUnit === original.price &&
    (current.note || '') === (original.notes || '') &&
    (current.co2CostId || 0) === (original.co2CostId || 0) &&
    (current.waste || 0) === (original.waste || 0) &&
    (current.formula || '') === (original.formula || '') &&
    (current.customerPrice ?? null) === (original.customerPrice ?? null) &&
    (current.markupPercent ?? null) === (original.markupPercent ?? null)
  )
}

function optionMatchesOriginal(current: OptionRow, original: OptionBudgetRowPayload): boolean {
  return (
    current.description === original.name &&
    current.quantity === original.quantity &&
    current.pricePerUnit === original.price &&
    (current.customerPrice ?? null) === (original.customerPrice ?? null) &&
    (current.markupPercent ?? null) === (original.markupPercent ?? null)
  )
}

function buildRowPayload(row: CalculationRow, includeId: boolean, operation: DiffOperation): BudgetRowPayload {
  const payload: BudgetRowPayload = {
    sectionId: 0,
    accountNo: parseAccountNo(row.account),
    name: row.description,
    quantity: row.quantity,
    price: row.pricePerUnit,
    amount: rowAmount(row),
    notes: row.note,
    co2CostId: row.co2CostId || 0,
    waste: row.waste,
    formula: row.formula || undefined,
    customerPrice: row.customerPrice ?? null,
    markupAmount: 0,
    markupPercent: row.markupPercent ?? null,
    revenue: row.revenue || 0,
    operation,
  }
  if (includeId && row.id) payload.id = row.id
  return payload
}

function buildDeletedRow(id: number): BudgetRowPayload {
  return {
    id,
    sectionId: 0,
    accountNo: 0,
    name: '',
    quantity: 0,
    price: 0,
    amount: 0,
    notes: '',
    co2CostId: 0,
    waste: 0,
    revenue: 0,
    operation: DiffOperation.Delete,
  }
}

function diffRows(
  current: CalculationRow[],
  original: BudgetRowPayload[] | undefined,
): { rows: BudgetRowPayload[]; changed: boolean } {
  const originals = original ?? []
  const result: BudgetRowPayload[] = []
  const seen = new Set<number>()
  let changed = false

  for (const row of current) {
    const orig = row.id ? originals.find((r) => r.id === row.id) : undefined
    if (!orig) {
      result.push(buildRowPayload(row, false, DiffOperation.Add))
      changed = true
      continue
    }
    if (orig.id !== undefined) seen.add(orig.id)
    if (!rowMatchesOriginal(row, orig)) {
      result.push(buildRowPayload(row, true, DiffOperation.Update))
      changed = true
    }
  }

  for (const orig of originals) {
    if (orig.id !== undefined && !seen.has(orig.id)) {
      result.push(buildDeletedRow(orig.id))
      changed = true
    }
  }

  return { rows: result, changed }
}

function buildAddSubSubsection(subSub: CalculationSubSubsection): CalculationSectionPayload {
  return {
    title: subSub.name,
    subSections: [],
    budgetRows: (subSub.rows || []).map((row) => buildRowPayload(row, false, DiffOperation.Add)),
    operation: DiffOperation.Add,
  }
}

function buildAddSubsection(subsection: CalculationSubsection): CalculationSectionPayload {
  return {
    title: subsection.name,
    subSections: (subsection.subSubsections || []).map(buildAddSubSubsection),
    budgetRows: (subsection.rows || []).map((row) => buildRowPayload(row, false, DiffOperation.Add)),
    operation: DiffOperation.Add,
  }
}

function buildAddSection(section: CalculationSection): CalculationSectionPayload {
  return {
    title: section.name,
    subSections: (section.subsections || []).map(buildAddSubsection),
    budgetRows: [],
    operation: DiffOperation.Add,
  }
}

function diffSubSubsection(
  current: CalculationSubSubsection,
  original: CalculationSectionPayload | undefined,
): { payload: CalculationSectionPayload | null; changed: boolean } {
  if (!original) {
    return { payload: buildAddSubSubsection(current), changed: true }
  }
  const { rows, changed: rowsChanged } = diffRows(current.rows || [], original.budgetRows)
  const titleChanged = current.name !== original.title
  if (!titleChanged && !rowsChanged) {
    return { payload: null, changed: false }
  }
  return {
    payload: {
      id: current.id,
      title: current.name,
      subSections: [],
      budgetRows: rows,
      operation: titleChanged ? DiffOperation.Update : DiffOperation.NoOp,
    },
    changed: true,
  }
}

function diffChildren<T extends { id?: number }>(
  currentChildren: T[],
  originalChildren: CalculationSectionPayload[] | undefined,
  matchAndDiff: (current: T, original: CalculationSectionPayload | undefined) => { payload: CalculationSectionPayload | null; changed: boolean },
): { children: CalculationSectionPayload[]; changed: boolean } {
  const originals = originalChildren ?? []
  const seen = new Set<number>()
  const out: CalculationSectionPayload[] = []
  let changed = false

  for (const child of currentChildren) {
    const orig = child.id ? originals.find((s) => s.id === child.id) : undefined
    if (orig?.id !== undefined) seen.add(orig.id)
    const { payload, changed: childChanged } = matchAndDiff(child, orig)
    if (payload) out.push(payload)
    if (childChanged) changed = true
  }

  for (const orig of originals) {
    if (orig.id !== undefined && !seen.has(orig.id)) {
      out.push({
        id: orig.id,
        title: '',
        subSections: [],
        budgetRows: [],
        operation: DiffOperation.Delete,
      })
      changed = true
    }
  }

  return { children: out, changed }
}

function diffSubsection(
  current: CalculationSubsection,
  original: CalculationSectionPayload | undefined,
): { payload: CalculationSectionPayload | null; changed: boolean } {
  if (!original) {
    return { payload: buildAddSubsection(current), changed: true }
  }
  const { rows, changed: rowsChanged } = diffRows(current.rows || [], original.budgetRows)
  const { children: subSections, changed: subSubChanged } = diffChildren<CalculationSubSubsection>(
    current.subSubsections || [],
    original.subSections,
    (child, orig) => diffSubSubsection(child, orig),
  )
  const titleChanged = current.name !== original.title
  if (!titleChanged && !rowsChanged && !subSubChanged) {
    return { payload: null, changed: false }
  }
  return {
    payload: {
      id: current.id,
      title: current.name,
      subSections,
      budgetRows: rows,
      operation: titleChanged ? DiffOperation.Update : DiffOperation.NoOp,
    },
    changed: true,
  }
}

function diffSection(
  current: CalculationSection,
  original: CalculationSectionPayload | undefined,
): { payload: CalculationSectionPayload | null; changed: boolean } {
  if (!original) {
    return { payload: buildAddSection(current), changed: true }
  }
  const { children: subSections, changed: subChanged } = diffChildren<CalculationSubsection>(
    current.subsections || [],
    original.subSections,
    (child, orig) => diffSubsection(child, orig),
  )
  const titleChanged = current.name !== original.title
  if (!titleChanged && !subChanged) {
    return { payload: null, changed: false }
  }
  return {
    payload: {
      id: current.id,
      title: current.name,
      subSections,
      budgetRows: [],
      operation: titleChanged ? DiffOperation.Update : DiffOperation.NoOp,
    },
    changed: true,
  }
}

export function buildSectionsDiff(
  current: CalculationSection[],
  original: CalculationSectionPayload[] | undefined,
): CalculationSectionPayload[] {
  const { children } = diffChildren<CalculationSection>(
    current,
    original,
    (child, orig) => diffSection(child, orig),
  )
  return children
}

export function buildOptionsDiff(
  current: OptionRow[],
  original: OptionBudgetRowPayload[] | undefined,
): OptionBudgetRowPayload[] {
  const originals = original ?? []
  const out: OptionBudgetRowPayload[] = []
  const seen = new Set<number>()

  for (const opt of current) {
    const orig = opt.id ? originals.find((o) => o.id === opt.id) : undefined
    if (!orig) {
      out.push({
        accountNo: 0,
        name: opt.description,
        quantity: opt.quantity,
        price: opt.pricePerUnit,
        amount: opt.quantity * opt.pricePerUnit,
        customerPrice: opt.customerPrice ?? null,
        markupAmount: 0,
        markupPercent: opt.markupPercent ?? null,
        revenue: opt.revenue || 0,
        operation: DiffOperation.Add,
      })
      continue
    }
    if (orig.id !== undefined) seen.add(orig.id)
    if (!optionMatchesOriginal(opt, orig)) {
      out.push({
        id: opt.id,
        accountNo: 0,
        name: opt.description,
        quantity: opt.quantity,
        price: opt.pricePerUnit,
        amount: opt.quantity * opt.pricePerUnit,
        customerPrice: opt.customerPrice ?? null,
        markupAmount: 0,
        markupPercent: opt.markupPercent ?? null,
        revenue: opt.revenue || 0,
        operation: DiffOperation.Update,
      })
    }
  }

  for (const orig of originals) {
    if (orig.id !== undefined && !seen.has(orig.id)) {
      out.push({
        id: orig.id,
        accountNo: 0,
        name: '',
        quantity: 0,
        price: 0,
        amount: 0,
        revenue: 0,
        operation: DiffOperation.Delete,
      })
    }
  }

  return out
}
