/**
 * Automação de WhatsApp simulada (sem a API oficial da Meta): monta links wa.me com a mensagem
 * já preenchida. A gestão clica e o WhatsApp abre pronto para enviar — funciona de verdade, de
 * graça, sem gateway. Espelha a abordagem do PIX/boleto: artefato de formato real, sem serviço
 * externo por trás.
 */

/** Normaliza um telefone brasileiro para o formato E.164 sem "+" (ex.: 5548999998888). */
export function telefoneE164(telefone: string | null | undefined): string | null {
  const d = (telefone ?? '').replace(/\D/g, '')
  if (d.length < 10) return null // sem DDD + número mínimo
  if (d.startsWith('55') && d.length >= 12) return d // já tem código do país
  if (d.length === 10 || d.length === 11) return `55${d}` // DDD + número
  return d
}

/**
 * Link wa.me com o texto pré-preenchido, ou null se o telefone for inválido.
 * Sem telefone válido, use {@link waLinkSemNumero} para deixar o usuário escolher o contato.
 */
export function waLink(telefone: string | null | undefined, texto: string): string | null {
  const fone = telefoneE164(telefone)
  if (!fone) return null
  return `https://wa.me/${fone}?text=${encodeURIComponent(texto)}`
}

/** Link do WhatsApp com a mensagem pronta, mas sem destinatário (o usuário escolhe o contato). */
export function waLinkSemNumero(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}

/** Abre o WhatsApp numa nova aba com a mensagem pronta (número opcional). */
export function abrirWhatsApp(telefone: string | null | undefined, texto: string): void {
  const url = waLink(telefone, texto) ?? waLinkSemNumero(texto)
  window.open(url, '_blank', 'noopener,noreferrer')
}
