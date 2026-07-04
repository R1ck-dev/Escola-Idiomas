const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** R$ 1.234,56 */
export function formatBRL(valor: number | null | undefined): string {
  return brl.format(valor ?? 0)
}

/** "yyyy-MM-dd" (ou ISO) → dd/mm/aaaa, sem deslocamento de fuso. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

/** "HH:mm:ss" → "HH:mm" */
export function formatHora(hora: string | null | undefined): string {
  if (!hora) return ''
  return hora.slice(0, 5)
}

/** "2026-07" → "julho de 2026" */
export function formatCompetencia(competencia: string | null | undefined): string {
  if (!competencia) return '—'
  const [ano, mes] = competencia.split('-')
  const idx = Number(mes) - 1
  return MESES[idx] ? `${MESES[idx]} de ${ano}` : competencia
}

/** "2026-07" → "jul/26" (compacto). */
export function formatCompetenciaCurta(competencia: string | null | undefined): string {
  if (!competencia) return '—'
  const [ano, mes] = competencia.split('-')
  const idx = Number(mes) - 1
  return MESES[idx] ? `${MESES[idx].slice(0, 3)}/${ano.slice(2)}` : competencia
}

/** Competência do mês atual, "yyyy-MM". */
export function competenciaAtual(hoje = new Date()): string {
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

/** Percentual inteiro amigável a partir de número (ex.: 50.00 → "50%"). */
export function formatPercent(valor: number | null | undefined): string {
  if (valor == null) return '—'
  const s = Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace('.', ',')
  return `${s}%`
}
