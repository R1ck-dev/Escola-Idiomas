import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CaretLeft, ChartBar, IdentificationCard, Wallet } from '@phosphor-icons/react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { useAlunoDetalhe } from '@/api/gestao'
import { formatBRL, formatCompetencia, formatDate, formatHora } from '@/lib/format'
import { situacaoAprovacao, statusMensalidade } from '@/lib/status'
import type { AlunoDetalhe, Boletim, Mensalidade, TurmaDoAluno } from '@/types/api'

/** Média com vírgula decimal, ex.: 81.5 → "81,5". */
function formatNota(n: number | null): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
}

function faixaHorario(t: TurmaDoAluno): string {
  const ini = formatHora(t.horaInicio)
  const fim = formatHora(t.horaFim)
  if (ini && fim) return `${ini}–${fim}`
  return ini || ''
}

/** Título de seção com ícone. */
function SecaoTitulo({ icon, children, count }: { icon: ReactNode; children: ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-navy-50 text-brand">{icon}</span>
      <h2 className="text-[17px] font-bold text-ink">{children}</h2>
      {count != null && <span className="tabular text-sm text-ink-muted">({count})</span>}
    </div>
  )
}

/** Linha rótulo/valor dos dados cadastrais. */
function Campo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] font-medium uppercase tracking-wide text-ink-subtle">{rotulo}</dt>
      <dd className="break-words text-[15px] text-ink">{valor || '—'}</dd>
    </div>
  )
}

function DadosCadastrais({ a }: { a: AlunoDetalhe }) {
  return (
    <Card className="flex flex-col gap-5 p-6">
      <SecaoTitulo icon={<IdentificationCard size={18} weight="fill" />}>Dados cadastrais</SecaoTitulo>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Campo rotulo="CPF" valor={a.cpf} />
        <Campo rotulo="RG" valor={a.rg} />
        <Campo rotulo="Telefone" valor={a.telefone} />
        <Campo rotulo="Nascimento" valor={a.dataNascimento ? formatDate(a.dataNascimento) : null} />
        <Campo rotulo="E-mail" valor={a.email} />
        <Campo rotulo="Endereço" valor={a.endereco} />
      </dl>
      {a.observacoes && (
        <div className="rounded-xl bg-canvas px-4 py-3 text-[14px] text-ink-muted">
          <span className="font-medium text-ink">Observações: </span>
          {a.observacoes}
        </div>
      )}
      {a.menor && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <div className="flex items-center gap-2">
            <Badge tone="neutralAlt" dot={false} className="px-2 py-0.5 text-[11px]">
              menor
            </Badge>
            <span className="text-[13px] font-semibold text-ink">Responsável financeiro</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Campo rotulo="Nome" valor={a.responsavelNome} />
            <Campo rotulo="CPF" valor={a.responsavelCpf} />
            <Campo rotulo="Telefone" valor={a.responsavelTelefone} />
            <Campo rotulo="E-mail" valor={a.responsavelEmail} />
          </dl>
        </div>
      )}
    </Card>
  )
}

function TurmaItem({ t }: { t: TurmaDoAluno }) {
  const linha = [t.nivel ? `Nível ${t.nivel}` : null, t.professorNome, [t.diasSemana, faixaHorario(t)].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' · ')
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink">{t.nome}</p>
          {!t.ativa && (
            <Badge tone="neutral" dot={false} className="px-2 py-0.5 text-[11px]">
              inativa
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-ink-muted">{linha || t.idioma}</p>
      </div>
      <span className="shrink-0 tabular text-sm text-ink-muted">{formatBRL(t.valorMensalidade)}/mês</span>
    </div>
  )
}

function BoletimItem({ b }: { b: Boletim }) {
  const sit = situacaoAprovacao[b.situacao]
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-ink">{b.turmaNome ?? 'Turma'}</p>
        <Badge tone={sit.tone}>{sit.label}</Badge>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-muted">
        <span>Semestre <strong className="text-ink">{b.semestreReferencia}</strong></span>
        <span>Média <strong className="tabular text-ink">{formatNota(b.media)}</strong></span>
        <span>
          Faltas <strong className="tabular text-ink">{b.faltas}/{b.totalAulas}</strong>
        </span>
        <span>Midterm <strong className="tabular text-ink">{formatNota(b.notaMidterm)}</strong></span>
        <span>Final <strong className="tabular text-ink">{formatNota(b.notaFinal)}</strong></span>
      </div>
    </div>
  )
}

function MensalidadeItem({ m }: { m: Mensalidade }) {
  const info = statusMensalidade[m.situacao]
  const atrasada = m.situacao === 'ATRASADA'
  const valor = atrasada ? m.valorAtualizado : m.valorEfetivo
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{formatCompetencia(m.competencia)}</p>
          <Badge tone={info.tone}>{info.label}</Badge>
          {m.prorata && (
            <Badge tone="neutral" dot={false} className="px-2 py-0.5 text-[11px]">
              pró-rata
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {m.situacao === 'PAGA' && m.dataPagamento
            ? `Pago em ${formatDate(m.dataPagamento)}`
            : `Vence em ${formatDate(m.vencimento)}${atrasada ? ` · ${m.diasAtraso} ${m.diasAtraso === 1 ? 'dia' : 'dias'} de atraso` : ''}`}
        </p>
      </div>
      <span className="shrink-0 tabular font-semibold text-ink">{formatBRL(valor)}</span>
    </div>
  )
}

export default function GestaoAlunoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { data: aluno, isLoading, isError, refetch } = useAlunoDetalhe(id)

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/gestao/matriculas"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-brand"
      >
        <CaretLeft size={16} weight="bold" />
        Voltar
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState title="Não foi possível carregar o aluno" onRetry={() => refetch()} />
      ) : !aluno ? (
        <EmptyState
          icon={<IdentificationCard size={30} className="text-brand" />}
          title="Aluno não encontrado"
          description="Verifique o link ou tente pela busca novamente."
        />
      ) : (
        <>
          <header className="flex items-center gap-4">
            <Avatar nome={aluno.nome} tint className="size-14 text-lg" />
            <div className="min-w-0">
              <h1 className="text-[24px] font-extrabold tracking-[-.015em] text-ink">{aluno.nome}</h1>
              <p className="truncate text-[15px] text-ink-muted">{aluno.email}</p>
            </div>
          </header>

          <DadosCadastrais a={aluno} />

          <Card className="flex flex-col gap-4 p-6">
            <SecaoTitulo icon={<ChartBar size={18} weight="fill" />} count={aluno.turmas.length}>
              Turmas
            </SecaoTitulo>
            {aluno.turmas.length === 0 ? (
              <p className="text-sm text-ink-muted">Este aluno não está em nenhuma turma.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {aluno.turmas.map((t) => (
                  <TurmaItem key={t.id} t={t} />
                ))}
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <SecaoTitulo icon={<ChartBar size={18} weight="fill" />} count={aluno.boletins.length}>
              Boletim
            </SecaoTitulo>
            {aluno.boletins.length === 0 ? (
              <p className="text-sm text-ink-muted">Nenhuma nota lançada ainda.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {aluno.boletins.map((b) => (
                  <BoletimItem key={b.matriculaId + b.semestreId} b={b} />
                ))}
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <SecaoTitulo icon={<Wallet size={18} weight="fill" />} count={aluno.mensalidades.length}>
              Mensalidades
            </SecaoTitulo>
            {aluno.mensalidades.length === 0 ? (
              <p className="text-sm text-ink-muted">Nenhuma mensalidade gerada.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {aluno.mensalidades.map((m) => (
                  <MensalidadeItem key={m.id} m={m} />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
