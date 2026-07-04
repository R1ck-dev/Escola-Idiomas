import {
  CalendarBlank,
  CheckCircle,
  Clock,
  Confetti,
  Wallet,
  XCircle,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { competenciaAtual, formatBRL, formatCompetencia, formatDate } from '@/lib/format'
import { statusMensalidade } from '@/lib/status'
import { useMinhasMensalidades } from '@/api/aluno'
import type { Mensalidade, StatusMensalidade } from '@/types/api'

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

/** Aviso tranquilizador — no MVP não há pagamento on-line. */
function AvisoPagamento() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-info-bg p-4">
      <Wallet size={20} weight="fill" className="mt-0.5 shrink-0 text-info" />
      <p className="text-[13px] leading-relaxed text-info">
        O pagamento é feito na escola e registrado pela secretaria — ainda não há pagamento on-line.
        Qualquer dúvida, fale com a gente.
      </p>
    </div>
  )
}

function DestaqueMensalidade({ m }: { m: Mensalidade }) {
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
        <AvisoPagamento />
      </div>
    </section>
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
          {destaque ? <DestaqueMensalidade m={destaque} /> : <EmDia />}

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
    </div>
  )
}
