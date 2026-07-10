import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Barcode as BarcodeIcon,
  CalendarBlank,
  CheckCircle,
  Clock,
  Confetti,
  Copy,
  Printer,
  QrCode,
  Wallet,
  XCircle,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { toast } from '@/components/ui/toaster'
import { api, mensagemErro } from '@/lib/api'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate } from '@/lib/format'
import { codigoBarrasSvg, formatarLinhaDigitavel, interleaved2of5 } from '@/lib/barcode'
import { statusMensalidade } from '@/lib/status'
import { useMeuBoleto, useMinhaPix, useMinhasMensalidades } from '@/api/aluno'
import type { BoletoCobranca, Mensalidade, StatusMensalidade } from '@/types/api'

/** Valor a exibir: atrasada usa o valor com multa/juros; senão o valor da parcela. */
function valorPrincipal(m: Mensalidade): number {
  return m.situacao === 'ATRASADA' ? m.valorAtualizado : m.valorEfetivo
}

function textoAtraso(dias: number): string {
  if (dias <= 0) return 'vence hoje'
  if (dias === 1) return 'venceu há 1 dia'
  return `venceu há ${dias} dias`
}

/** Ícone + tint por situação, para o marcador do card de histórico. */
const VISUAL: Record<StatusMensalidade, { icon: typeof Wallet; box: string; fg: string }> = {
  PAGA: { icon: CheckCircle, box: 'bg-success-bg', fg: 'text-success-dark' },
  ATRASADA: { icon: Clock, box: 'bg-danger-bg', fg: 'text-danger-dark' },
  ABERTA: { icon: CalendarBlank, box: 'bg-info-bg', fg: 'text-info' },
  CANCELADA: { icon: XCircle, box: 'bg-surface-2', fg: 'text-ink-subtle' },
}

/** Aviso de meios de pagamento. */
function AvisoPagamento() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-info-bg p-4">
      <Wallet size={20} weight="fill" className="mt-0.5 shrink-0 text-info" />
      <p className="text-[13px] leading-relaxed text-info">
        Você pode pagar por PIX aqui pelo app ou diretamente na secretaria. Qualquer dúvida, fale com a gente.
      </p>
    </div>
  )
}

function DestaqueMensalidade({
  m,
  onPagar,
  onBoleto,
}: {
  m: Mensalidade
  onPagar: () => void
  onBoleto: () => void
}) {
  const s = statusMensalidade[m.situacao]
  const atrasada = m.situacao === 'ATRASADA'
  const badgeLabel = atrasada && m.diasAtraso > 0 ? `${s.label} · ${m.diasAtraso} dias` : s.label

  return (
    <section
      className={`rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,.04)] sm:p-7 ${
        atrasada ? 'border-2 border-[#F3C5B4]' : 'border border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            <Wallet size={15} weight="fill" />
            Mensalidade de {formatCompetencia(m.competencia)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">Vencimento {formatDate(m.vencimento)}</p>
        </div>
        <Badge tone={s.tone}>{badgeLabel}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="text-4xl font-extrabold tracking-tight text-brand tabular">
          {formatBRL(valorPrincipal(m))}
        </span>
        {atrasada && (
          <span className="pb-1 text-sm font-semibold text-danger-dark">com multa e juros</span>
        )}
      </div>

      {atrasada && (
        <p className="mt-1.5 text-sm text-ink-muted">
          Valor original <span className="font-semibold tabular">{formatBRL(m.valorEfetivo)}</span> ·{' '}
          {textoAtraso(m.diasAtraso)}
        </p>
      )}

      <div className="mt-5">
        {m.situacao === 'ABERTA' || m.situacao === 'ATRASADA' ? (
          <div className="flex flex-col gap-2">
            <Button variant="primary" className="w-full" onClick={onPagar}>
              <QrCode size={20} weight="fill" />
              Pagar com PIX
            </Button>
            <Button variant="secondary" className="w-full" onClick={onBoleto}>
              <BarcodeIcon size={20} weight="fill" />
              Emitir boleto
            </Button>
            <p className="text-center text-[13px] text-ink-muted">
              Pague na hora por PIX, gere um boleto ou pague diretamente na secretaria.
            </p>
          </div>
        ) : (
          <AvisoPagamento />
        )}
      </div>
    </section>
  )
}

/** Modal com o QR Code e o copia-e-cola do PIX da mensalidade selecionada. */
function PixDialog({ mensalidade, onClose }: { mensalidade: Mensalidade | null; onClose: () => void }) {
  const { data: pix, isLoading, isError, refetch } = useMinhaPix(mensalidade?.id ?? null)
  const qc = useQueryClient()
  const [simulando, setSimulando] = useState(false)

  // Só em DEV: botão que imita o aviso do banco (webhook) e marca a mensalidade como paga.
  const devSimular = import.meta.env.DEV && !!import.meta.env.VITE_JOB_SECRET

  async function copiar() {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.copiaECola)
      toast.success('Código PIX copiado.')
    } catch {
      toast.error('Não foi possível copiar. Selecione o código e copie manualmente.')
    }
  }

  async function simularPagamento() {
    if (!pix) return
    setSimulando(true)
    try {
      await api.post('/jobs/pix/confirmar', null, {
        params: { mensalidadeId: pix.mensalidadeId },
        headers: { 'X-Job-Secret': import.meta.env.VITE_JOB_SECRET },
      })
      toast.success('Pagamento confirmado (simulado).')
      qc.invalidateQueries({ queryKey: ['aluno', 'mensalidades'] })
      onClose()
    } catch (e) {
      toast.error(mensagemErro(e))
    } finally {
      setSimulando(false)
    }
  }

  return (
    <Dialog open={mensalidade != null} onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar com PIX</DialogTitle>
          <DialogDescription>
            {mensalidade && `Mensalidade de ${formatCompetencia(mensalidade.competencia)}`}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <LoadingRows rows={3} />
          ) : isError || !pix ? (
            <ErrorState
              title="Não foi possível gerar o PIX"
              description="Tente novamente em instantes."
              onRetry={() => refetch()}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Valor a pagar</p>
                <p className="text-4xl font-extrabold tracking-tight text-brand tabular">{formatBRL(pix.valor)}</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4">
                <QRCodeSVG value={pix.copiaECola} size={196} level="M" marginSize={0} />
              </div>

              <div className="w-full">
                <p className="mb-1.5 text-[13px] font-semibold text-ink">PIX copia e cola</p>
                <p className="max-h-24 overflow-y-auto break-all rounded-xl border border-line bg-surface-2 p-3 text-[12px] text-ink-muted">
                  {pix.copiaECola}
                </p>
                <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={copiar}>
                  <Copy size={18} />
                  Copiar código
                </Button>
              </div>

              <p className="text-center text-[12px] text-ink-subtle">
                Recebedor: {pix.recebedor} · Chave: {pix.chave}
              </p>

              {devSimular && (
                <div className="w-full border-t border-dashed border-line pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    loading={simulando}
                    onClick={simularPagamento}
                  >
                    Já paguei (simular confirmação)
                  </Button>
                  <p className="mt-1 text-center text-[11px] text-ink-subtle">
                    Só em desenvolvimento — imita o aviso de pagamento do banco.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

/** Código de barras Interleaved 2 of 5 renderizado como SVG (barras pretas). */
function Barcode({ codigo }: { codigo: string }) {
  const { barras, largura } = interleaved2of5(codigo)
  return (
    <svg
      viewBox={`0 0 ${largura} 64`}
      preserveAspectRatio="none"
      className="h-16 w-full text-black"
      role="img"
      aria-label="Código de barras do boleto"
    >
      {barras.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={64} fill="currentColor" />
      ))}
    </svg>
  )
}

/** Abre uma janela de impressão com o boleto (barras + linha digitável) formatado. */
function imprimirBoleto(b: BoletoCobranca) {
  const svg = codigoBarrasSvg(b.codigoBarras)
  const venc = formatDate(b.vencimento)
  const valor = formatBRL(b.valor)
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Boleto ${formatCompetencia(b.competencia)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #101828; margin: 24px; }
  .boleto { max-width: 720px; margin: 0 auto; border: 1px solid #101828; }
  .top { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #101828; padding: 10px 14px; }
  .top .banco { font-size: 22px; font-weight: 800; }
  .top .linha { margin-left: auto; font-size: 18px; font-weight: 700; letter-spacing: .5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; }
  .cell { padding: 8px 14px; border-top: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; }
  .cell:nth-child(2n) { border-right: none; }
  .cell .rot { font-size: 10px; text-transform: uppercase; color: #667085; letter-spacing: .4px; }
  .cell .val { font-size: 15px; font-weight: 600; margin-top: 2px; }
  .barras { padding: 16px 14px 20px; }
  .obs { font-size: 11px; color: #667085; margin-top: 8px; text-align: center; }
  @media print { body { margin: 0; } }
</style></head><body>
<div class="boleto">
  <div class="top">
    <span class="banco">${b.beneficiario}</span>
    <span class="linha">${formatarLinhaDigitavel(b.linhaDigitavel)}</span>
  </div>
  <div class="grid">
    <div class="cell"><div class="rot">Beneficiário</div><div class="val">${b.beneficiario}</div></div>
    <div class="cell"><div class="rot">Nosso número</div><div class="val">${b.nossoNumero}</div></div>
    <div class="cell"><div class="rot">Vencimento</div><div class="val">${venc}</div></div>
    <div class="cell"><div class="rot">Valor do documento</div><div class="val">${valor}</div></div>
    <div class="cell" style="grid-column: 1 / -1; border-right: none;">
      <div class="rot">Competência</div><div class="val">${formatCompetencia(b.competencia)}</div>
    </div>
  </div>
  <div class="barras">${svg}</div>
  <p class="obs">Boleto simulado — sem registro bancário. Use o PIX ou a secretaria para o pagamento efetivo.</p>
</div>
<script>window.onload = function () { window.print() }</script>
</body></html>`

  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) {
    toast.error('Habilite pop-ups para imprimir o boleto.')
    return
  }
  w.document.write(html)
  w.document.close()
}

/** Modal com o boleto (código de barras + linha digitável) da mensalidade selecionada. */
function BoletoDialog({ mensalidade, onClose }: { mensalidade: Mensalidade | null; onClose: () => void }) {
  const { data: boleto, isLoading, isError, refetch } = useMeuBoleto(mensalidade?.id ?? null)
  const qc = useQueryClient()
  const [simulando, setSimulando] = useState(false)

  // Só em DEV: botão que imita a compensação bancária e marca a mensalidade como paga.
  const devSimular = import.meta.env.DEV && !!import.meta.env.VITE_JOB_SECRET

  async function copiar() {
    if (!boleto) return
    try {
      await navigator.clipboard.writeText(boleto.linhaDigitavel)
      toast.success('Linha digitável copiada.')
    } catch {
      toast.error('Não foi possível copiar. Selecione o código e copie manualmente.')
    }
  }

  async function simularPagamento() {
    if (!boleto) return
    setSimulando(true)
    try {
      await api.post('/jobs/pix/confirmar', null, {
        params: { mensalidadeId: boleto.mensalidadeId },
        headers: { 'X-Job-Secret': import.meta.env.VITE_JOB_SECRET },
      })
      toast.success('Pagamento confirmado (simulado).')
      qc.invalidateQueries({ queryKey: ['aluno', 'mensalidades'] })
      onClose()
    } catch (e) {
      toast.error(mensagemErro(e))
    } finally {
      setSimulando(false)
    }
  }

  return (
    <Dialog open={mensalidade != null} onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Boleto bancário</DialogTitle>
          <DialogDescription>
            {mensalidade && `Mensalidade de ${formatCompetencia(mensalidade.competencia)}`}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <LoadingRows rows={3} />
          ) : isError || !boleto ? (
            <ErrorState
              title="Não foi possível gerar o boleto"
              description="Tente novamente em instantes."
              onRetry={() => refetch()}
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Valor do documento</p>
                <p className="text-4xl font-extrabold tracking-tight text-brand tabular">{formatBRL(boleto.valor)}</p>
                <p className="mt-1 text-[13px] text-ink-muted">Vencimento {formatDate(boleto.vencimento)}</p>
              </div>

              <div className="w-full rounded-2xl border border-line bg-white p-4">
                <Barcode codigo={boleto.codigoBarras} />
              </div>

              <div className="w-full">
                <p className="mb-1.5 text-[13px] font-semibold text-ink">Linha digitável</p>
                <p className="break-all rounded-xl border border-line bg-surface-2 p-3 text-center text-[13px] tabular text-ink-muted">
                  {formatarLinhaDigitavel(boleto.linhaDigitavel)}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={copiar}>
                    <Copy size={18} />
                    Copiar código
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => imprimirBoleto(boleto)}>
                    <Printer size={18} />
                    Imprimir
                  </Button>
                </div>
              </div>

              <p className="text-center text-[12px] text-ink-subtle">
                Beneficiário: {boleto.beneficiario} · Nosso número: {boleto.nossoNumero}
              </p>

              {devSimular && (
                <div className="w-full border-t border-dashed border-line pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    loading={simulando}
                    onClick={simularPagamento}
                  >
                    Já paguei (simular compensação)
                  </Button>
                  <p className="mt-1 text-center text-[11px] text-ink-subtle">
                    Só em desenvolvimento — imita a compensação do boleto no banco.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

function EmDia() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,.04)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-success-bg text-success-dark">
          <Confetti size={26} weight="fill" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-ink">Você está em dia!</h2>
          <p className="mt-1 text-[15px] text-ink-muted">
            Nenhuma mensalidade em aberto no momento. Continue assim.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <AvisoPagamento />
      </div>
    </section>
  )
}

function HistoricoCard({ m }: { m: Mensalidade }) {
  const s = statusMensalidade[m.situacao]
  const v = VISUAL[m.situacao]
  const Icone = v.icon
  const atrasada = m.situacao === 'ATRASADA'
  const paga = m.situacao === 'PAGA'

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)] sm:p-5">
      <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${v.box} ${v.fg}`}>
        <Icone size={22} weight="fill" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{formatCompetencia(m.competencia)}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {paga && m.dataPagamento
            ? `Pago em ${formatDate(m.dataPagamento)}`
            : `Vencimento ${formatDate(m.vencimento)}`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold text-ink tabular">{formatBRL(valorPrincipal(m))}</p>
        {atrasada && (
          <p className="mt-0.5 text-xs text-danger-dark">
            com multa · original <span className="tabular">{formatBRL(m.valorEfetivo)}</span>
          </p>
        )}
        <div className="mt-1.5 flex justify-end">
          <Badge tone={s.tone}>{s.label}</Badge>
        </div>
      </div>
    </li>
  )
}

export default function AlunoMensalidadesPage() {
  const { data, isLoading, isError, refetch } = useMinhasMensalidades()
  const [pixMensalidade, setPixMensalidade] = useState<Mensalidade | null>(null)
  const [boletoMensalidade, setBoletoMensalidade] = useState<Mensalidade | null>(null)

  const lista = data ?? []
  const emAberto = lista.filter((m) => m.situacao === 'ABERTA' || m.situacao === 'ATRASADA')

  // Destaque: a parcela do mês atual; senão, a mais recente em aberto/atrasada.
  const competencia = competenciaAtual()
  const porCompetenciaDesc = (a: Mensalidade, b: Mensalidade) =>
    b.competencia.localeCompare(a.competencia)

  const destaque =
    lista.find((m) => m.competencia === competencia) ??
    [...emAberto].sort(porCompetenciaDesc)[0] ??
    null

  const historico = lista
    .filter((m) => m.id !== destaque?.id)
    .sort(porCompetenciaDesc)

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">
          Minhas mensalidades
        </h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          Acompanhe o que está em aberto e o histórico.
        </p>
      </header>

      {isLoading ? (
        <LoadingRows rows={4} />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar suas mensalidades"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : lista.length === 0 ? (
        <EmptyState
          icon={<Wallet size={30} className="text-brand" />}
          title="Você ainda não tem mensalidades"
          description="Assim que sua matrícula for aprovada, suas mensalidades aparecem aqui."
          tintClass="bg-navy-50"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {destaque ? (
            <DestaqueMensalidade
              m={destaque}
              onPagar={() => setPixMensalidade(destaque)}
              onBoleto={() => setBoletoMensalidade(destaque)}
            />
          ) : (
            <EmDia />
          )}

          {historico.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold tracking-tight text-ink">Histórico</h2>
              <ul className="flex flex-col gap-3">
                {historico.map((m) => (
                  <HistoricoCard key={m.id} m={m} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <PixDialog mensalidade={pixMensalidade} onClose={() => setPixMensalidade(null)} />
      <BoletoDialog mensalidade={boletoMensalidade} onClose={() => setBoletoMensalidade(null)} />
    </div>
  )
}
