/**
 * Máscaras de formatação para inputs (aplicadas no onChange). Todas são idempotentes
 * e toleram texto já formatado — reformatam a partir dos dígitos.
 */

const digitos = (v: string) => v.replace(/\D/g, '')

/** CPF → 000.000.000-00 (até 11 dígitos). */
export function maskCpf(valor: string): string {
  const d = digitos(valor).slice(0, 11)
  let out = d
  if (d.length > 9) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  else if (d.length > 6) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  else if (d.length > 3) out = `${d.slice(0, 3)}.${d.slice(3)}`
  return out
}

/** Telefone → (00) 00000-0000 (celular, 11 díg.) ou (00) 0000-0000 (fixo, 10 díg.). */
export function maskTelefone(valor: string): string {
  const d = digitos(valor).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const corte = resto.length > 8 ? 5 : 4 // 9º dígito → 5 antes do traço
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

/** RG → 00.000.000-0 (mantém dígito verificador; até 9 caracteres). */
export function maskRg(valor: string): string {
  const d = digitos(valor).slice(0, 9)
  let out = d
  if (d.length > 8) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}-${d.slice(8)}`
  else if (d.length > 5) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  else if (d.length > 2) out = `${d.slice(0, 2)}.${d.slice(2)}`
  return out
}
