type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '(' | ')' }

function tokenize(input: string): Token[] | null {
  const s = input.replaceAll(' ', '').replaceAll(',', '.')
  if (s.length === 0) return []

  const tokens: Token[] = []
  let i = 0

  const isDigit = (c: string) => c >= '0' && c <= '9'

  while (i < s.length) {
    const c = s[i]

    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '(' || c === ')') {
      tokens.push({ type: 'op', value: c })
      i++
      continue
    }

    if (isDigit(c) || c === '.') {
      let j = i
      while (j < s.length && (isDigit(s[j]) || s[j] === '.')) j++
      const raw = s.slice(i, j)
      // reject "." or "1..2" etc
      if (raw === '.' || raw.split('.').length > 2) return null
      const n = Number(raw)
      if (!Number.isFinite(n)) return null
      tokens.push({ type: 'number', value: n })
      i = j
      continue
    }

    return null
  }

  return tokens
}

export function evaluateArithmeticExpression(input: string): number | null {
  const tokens = tokenize(input)
  if (!tokens) return null
  if (tokens.length === 0) return null

  let idx = 0

  const peek = () => tokens[idx]
  const consume = () => tokens[idx++]

  const parseFactor = (): number | null => {
    const t = peek()
    if (!t) return null

    if (t.type === 'op' && (t.value === '+' || t.value === '-')) {
      consume()
      const v = parseFactor()
      if (v === null) return null
      return t.value === '-' ? -v : v
    }

    if (t.type === 'op' && t.value === '(') {
      consume()
      const v = parseExpr()
      const close = peek()
      if (v === null || !close || close.type !== 'op' || close.value !== ')') return null
      consume()
      return v
    }

    if (t.type === 'number') {
      consume()
      return t.value
    }

    return null
  }

  const parseTerm = (): number | null => {
    let left = parseFactor()
    if (left === null) return null

    while (true) {
      const t = peek()
      if (!t || t.type !== 'op' || (t.value !== '*' && t.value !== '/')) break
      consume()
      const right = parseFactor()
      if (right === null) return null
      if (t.value === '*') {
        left = left * right
      } else {
        if (right === 0) return null
        left = left / right
      }
      if (!Number.isFinite(left)) return null
    }

    return left
  }

  const parseExpr = (): number | null => {
    let left = parseTerm()
    if (left === null) return null

    while (true) {
      const t = peek()
      if (!t || t.type !== 'op' || (t.value !== '+' && t.value !== '-')) break
      consume()
      const right = parseTerm()
      if (right === null) return null
      left = t.value === '+' ? left + right : left - right
      if (!Number.isFinite(left)) return null
    }

    return left
  }

  const result = parseExpr()
  if (result === null) return null
  if (idx !== tokens.length) return null

  // normalize -0 to 0
  const normalized = Object.is(result, -0) ? 0 : result
  return Number.isFinite(normalized) ? normalized : null
}

export function evaluateIntegerArithmeticExpression(input: string): number | null {
  const raw = input.trim()
  if (raw.length === 0) return null

  // Only allow integers and operators. No decimals.
  // Allowed: digits, whitespace, + - * / ( )
  if (!/^[0-9+\-*/()\s]+$/.test(raw)) return null
  if (raw.includes('.') || raw.includes(',')) return null

  const result = evaluateArithmeticExpression(raw)
  if (result === null) return null

  const floored = Math.floor(result)
  return Math.max(0, floored)
}

