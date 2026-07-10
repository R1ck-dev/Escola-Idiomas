/**
 * Código de barras Interleaved 2 of 5 — o padrão usado nos boletos bancários (código de 44
 * dígitos). Cada par de dígitos é intercalado: o 1º vira as barras (preto), o 2º os espaços.
 */

// Padrão de cada dígito: 5 elementos, exatamente 2 largos ('w'); os demais estreitos ('n').
const PADROES: Record<string, string> = {
  '0': 'nnwwn',
  '1': 'wnnnw',
  '2': 'nwnnw',
  '3': 'wwnnn',
  '4': 'nnwnw',
  '5': 'wnwnn',
  '6': 'nwwnn',
  '7': 'nnnww',
  '8': 'wnnwn',
  '9': 'nwnwn',
}

export interface Barra {
  x: number // início (em módulos)
  w: number // largura (em módulos)
}

/**
 * Barras pretas do código (em unidades de "módulo"). Índices pares da sequência são barras;
 * ímpares, espaços. Retorna só as barras e a largura total, para desenhar como retângulos.
 */
export function interleaved2of5(codigo: string, larga = 3): { barras: Barra[]; largura: number } {
  let c = codigo.replace(/\D/g, '')
  if (c.length % 2 !== 0) c = '0' + c // I2of5 exige quantidade par de dígitos

  const seq: number[] = [1, 1, 1, 1] // start: barra-espaço-barra-espaço, todos estreitos
  for (let i = 0; i < c.length; i += 2) {
    const barras = PADROES[c[i]]
    const espacos = PADROES[c[i + 1]]
    for (let k = 0; k < 5; k++) {
      seq.push(barras[k] === 'w' ? larga : 1) // barra
      seq.push(espacos[k] === 'w' ? larga : 1) // espaço
    }
  }
  seq.push(larga, 1, 1) // stop: barra larga, espaço estreito, barra estreita

  const barras: Barra[] = []
  let x = 0
  for (let i = 0; i < seq.length; i++) {
    if (i % 2 === 0) barras.push({ x, w: seq[i] })
    x += seq[i]
  }
  return { barras, largura: x }
}

/** SVG do código de barras como string (para a janela de impressão). */
export function codigoBarrasSvg(codigo: string, altura = 60, moduloPx = 1.4): string {
  const { barras, largura } = interleaved2of5(codigo)
  const w = (largura * moduloPx).toFixed(1)
  const rects = barras
    .map((b) => `<rect x="${(b.x * moduloPx).toFixed(2)}" y="0" width="${(b.w * moduloPx).toFixed(2)}" height="${altura}"/>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${altura}" viewBox="0 0 ${w} ${altura}" preserveAspectRatio="none" fill="#000">${rects}</svg>`
}

/** Formata a linha digitável de 47 dígitos no padrão AAAAA.AAAAA BBBBB.BBBBBB CCCCC.CCCCCC D EEEEEEEEEEEEEE. */
export function formatarLinhaDigitavel(l: string): string {
  if (l.length !== 47) return l
  return (
    `${l.slice(0, 5)}.${l.slice(5, 10)} ` +
    `${l.slice(10, 15)}.${l.slice(15, 21)} ` +
    `${l.slice(21, 26)}.${l.slice(26, 32)} ` +
    `${l.slice(32, 33)} ${l.slice(33)}`
  )
}
