import * as React from 'react'
import { useState } from 'react'
import {
  CaretLeft,
  CaretRight,
  Check,
  ClipboardText,
  Clock,
  Confetti,
  Info,
  Lock,
  MagnifyingGlass,
  Prohibit,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { EmptyState, ErrorState, LoadingRows } from '@/components/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toaster'
import {
  useAprovarMatricula,
  useEncerrarMatricula,
  useMatriculas,
  useMoverParaListaEspera,
  useRejeitarMatricula,
  useTrancarMatricula,
  useTurmasGestao,
} from '@/api/gestao'
import { mensagemErro } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { statusMatricula } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { MatriculaDetalhada, StatusMatricula, TurmaGestao } from '@/types/api'

type Filtro = 'TODAS' | StatusMatricula
type AcaoTipo = 'aprovar' | 'rejeitar' | 'trancar' | 'encerrar' | 'listaEspera'

const TABS: { value: Filtro; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando' },
  { value: 'LISTA_ESPERA', label: 'Lista de espera' },
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'TRANCADA', label: 'Trancada' },
  { value: 'ENCERRADA', label: 'Encerrada' },
  { value: 'REJEITADA', label: 'Rejeitada' },
]

/** Valor com atraso de `delay`ms — debounce simples para a busca. */
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** Controles Anterior/Próxima + "Página X de Y" (índice 0-based). Some com página única. */
function Paginacao({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button variant="secondary" size="row" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        <CaretLeft size={16} weight="bold" />
        Anterior
      </Button>
      <span className="tabular text-[13px] text-ink-muted">
        Página {page + 1} de {totalPages}
      </span>
      <Button variant="secondary" size="row" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>
        Próxima
        <CaretRight size={16} weight="bold" />
      </Button>
    </div>
  )
}

/** Título + rótulo do botão de confirmação de cada ação, com o nome do aluno. */
function textoAcao(tipo: AcaoTipo, nome: string): {
  titulo: string
  confirmar: string
  variant: 'primary' | 'destructive'
} {
  switch (tipo) {
    case 'aprovar':
      return { titulo: `Aprovar matrícula de ${nome}?`, confirmar: 'Aprovar matrícula', variant: 'primary' }
    case 'rejeitar':
      return { titulo: `Rejeitar solicitação de ${nome}?`, confirmar: 'Rejeitar', variant: 'destructive' }
    case 'trancar':
      return { titulo: `Trancar matrícula de ${nome}?`, confirmar: 'Trancar matrícula', variant: 'primary' }
    case 'encerrar':
      return { titulo: `Encerrar matrícula de ${nome}?`, confirmar: 'Encerrar matrícula', variant: 'destructive' }
    case 'listaEspera':
      return {
        titulo: `Colocar ${nome} na lista de espera?`,
        confirmar: 'Mover para lista de espera',
        variant: 'primary',
      }
  }
}

/** Caixa de aviso do diálogo (efeito da ação). */
function AvisoBox({ tone, children }: { tone: 'info' | 'warning'; children: React.ReactNode }) {
  const Icone = tone === 'warning' ? WarningCircle : Info
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl p-4',
        tone === 'warning' ? 'bg-warning-bg text-warning-fg' : 'bg-info-bg text-info',
      )}
    >
      <Icone size={20} weight="fill" className="mt-0.5 shrink-0" />
      <p className="text-[13px] leading-relaxed">{children}</p>
    </div>
  )
}

/** Botões de ação de uma linha, conforme o status da matrícula. */
function AcoesLinha({
  m,
  onAcao,
}: {
  m: MatriculaDetalhada
  onAcao: (tipo: AcaoTipo, m: MatriculaDetalhada) => void
}) {
  if (m.status === 'AGUARDANDO_APROVACAO') {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="row" className="text-danger hover:text-danger" onClick={() => onAcao('rejeitar', m)}>
          <XCircle size={16} weight="bold" />
          Rejeitar
        </Button>
        <Button variant="primary" size="row" onClick={() => onAcao('aprovar', m)}>
          <Check size={16} weight="bold" />
          Aprovar
        </Button>
      </div>
    )
  }
  if (m.status === 'ATIVA') {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="row" onClick={() => onAcao('trancar', m)}>
          <Lock size={16} weight="bold" />
          Trancar
        </Button>
        <Button variant="ghost" size="row" className="text-danger hover:text-danger" onClick={() => onAcao('encerrar', m)}>
          <Prohibit size={16} weight="bold" />
          Encerrar
        </Button>
      </div>
    )
  }
  if (m.status === 'TRANCADA') {
    return (
      <div className="flex justify-end">
        <Button variant="ghost" size="row" className="text-danger hover:text-danger" onClick={() => onAcao('encerrar', m)}>
          <Prohibit size={16} weight="bold" />
          Encerrar
        </Button>
      </div>
    )
  }
  if (m.status === 'LISTA_ESPERA') {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="row" className="text-danger hover:text-danger" onClick={() => onAcao('rejeitar', m)}>
          <XCircle size={16} weight="bold" />
          Rejeitar
        </Button>
        <Button variant="primary" size="row" onClick={() => onAcao('aprovar', m)}>
          <Check size={16} weight="bold" />
          Alocar
        </Button>
      </div>
    )
  }
  return <div className="text-right text-sm text-ink-subtle">—</div>
}

/** Linha rótulo/valor dos dados do responsável (mostra "—" quando ausente). */
function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="w-16 shrink-0 text-ink-subtle">{rotulo}</dt>
      <dd className="min-w-0 break-words text-ink">{valor || '—'}</dd>
    </div>
  )
}

/**
 * Responsável (quando menor): nome clicável que expande os dados de contato
 * (CPF, telefone, e-mail). Fora do caso "menor", mostra "—".
 */
function ResponsavelDetalhes({ m }: { m: MatriculaDetalhada }) {
  const [aberto, setAberto] = useState(false)
  if (!m.menorIdade) return <span className="text-ink-subtle">—</span>
  const semContato = !m.responsavelCpf && !m.responsavelTelefone && !m.responsavelEmail
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="inline-flex items-center gap-1 font-medium text-ink transition hover:text-brand"
        >
          <CaretRight size={13} weight="bold" className={cn('transition-transform', aberto && 'rotate-90')} />
          <span className="underline-offset-2 hover:underline">{m.responsavelNome ?? 'Responsável'}</span>
        </button>
        <Badge tone="neutralAlt" dot={false} className="px-2 py-0.5 text-[11px]">
          menor
        </Badge>
      </div>
      {aberto && (
        <dl className="ml-[18px] flex flex-col gap-1 rounded-lg bg-canvas px-3 py-2 text-[13px]">
          {semContato ? (
            <span className="text-ink-subtle">Sem dados de contato cadastrados.</span>
          ) : (
            <>
              <LinhaInfo rotulo="CPF" valor={m.responsavelCpf} />
              <LinhaInfo rotulo="Telefone" valor={m.responsavelTelefone} />
              <LinhaInfo rotulo="E-mail" valor={m.responsavelEmail} />
            </>
          )}
        </dl>
      )}
    </div>
  )
}

/**
 * Card de revisão de uma solicitação (aba "Aguardando"): dados do aluno para revisão
 * (nome, e-mail), turma pretendida, data da solicitação e responsável quando menor —
 * mais as ações Aprovar/Rejeitar. Quando a turma pretendida está sem vagas, sinaliza
 * (borda âmbar + badge "Turma cheia") e desabilita o Aprovar.
 */
function CardSolicitacao({
  m,
  turma,
  onAcao,
}: {
  m: MatriculaDetalhada
  turma: TurmaGestao | undefined
  onAcao: (tipo: AcaoTipo, m: MatriculaDetalhada) => void
}) {
  const s = statusMatricula[m.status]
  const nome = m.alunoNome ?? 'Aluno'
  const cheia = turma ? turma.ocupacaoAtual >= turma.lotacaoMaxima : false

  const meta = [
    turma?.nome ?? m.turmaNome ?? 'Turma —',
    `solicitado em ${formatDate(m.dataMatricula)}`,
  ].join(' · ')

  return (
    <Card
      className={cn(
        'flex flex-col gap-4 p-5',
        cheia && 'border-[1.5px] border-[#F0D3AE] bg-warning-bg/40',
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <Avatar nome={nome} tint className="size-[52px] text-base" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[17px] font-bold leading-tight text-ink">{nome}</h3>
            <Badge tone={s.tone}>{s.label}</Badge>
            {cheia && (
              <Badge tone="warning" icon={<WarningCircle weight="fill" />}>
                Turma cheia
              </Badge>
            )}
          </div>
          {m.alunoEmail && <p className="mt-1 text-[13px] text-ink-subtle">{m.alunoEmail}</p>}
          <p className="mt-1 text-sm text-ink-muted">{meta}</p>
          {m.menorIdade && (
            <div className="mt-2 text-[13px]">
              <ResponsavelDetalhes m={m} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="row"
            className="text-danger hover:text-danger"
            onClick={() => onAcao('rejeitar', m)}
          >
            <XCircle size={16} weight="bold" />
            Rejeitar
          </Button>
          <Button variant="secondary" size="row" onClick={() => onAcao('listaEspera', m)}>
            <Clock size={16} weight="bold" />
            Lista de espera
          </Button>
          <Button
            variant="primary"
            size="row"
            disabled={cheia}
            title={cheia ? 'Turma sem vagas — coloque na lista de espera ou libere uma vaga.' : undefined}
            onClick={() => onAcao('aprovar', m)}
          >
            <Check size={16} weight="bold" />
            Aprovar
          </Button>
        </div>
      </div>

      {cheia && turma && (
        <div className="flex items-start gap-2 rounded-xl bg-warning-bg px-3.5 py-2.5 text-[13px] leading-relaxed text-[#C8461F]">
          <WarningCircle size={17} weight="fill" className="mt-px shrink-0" />
          <span>
            Turma sem vagas ({turma.ocupacaoAtual}/{turma.lotacaoMaxima}) — coloque o candidato na
            lista de espera ou libere uma vaga antes de aprovar.
          </span>
        </div>
      )}
    </Card>
  )
}

export default function GestaoMatriculasPage() {
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [busca, setBusca] = useState('')
  const [page, setPage] = useState(0)
  const [acao, setAcao] = useState<{ tipo: AcaoTipo; m: MatriculaDetalhada } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [motivoErro, setMotivoErro] = useState<string | null>(null)

  const q = useDebounced(busca.trim(), 300)

  // Nova busca (com debounce) volta à primeira página.
  React.useEffect(() => {
    setPage(0)
  }, [q])

  // Página filtrada da lista de matrículas. Contagens vêm de data.totalElements, não do content.
  const { data, isLoading, isError, refetch } = useMatriculas({
    status: filtro === 'TODAS' ? undefined : filtro,
    q: q || undefined,
    page,
  })

  // Ocupação das turmas para sinalizar "turma cheia" na revisão (join por turmaId).
  const { data: turmas } = useTurmasGestao()
  const turmaPorId = React.useMemo(() => {
    const mapa = new Map<string, TurmaGestao>()
    for (const t of turmas ?? []) mapa.set(t.id, t)
    return mapa
  }, [turmas])

  const aprovar = useAprovarMatricula()
  const rejeitar = useRejeitarMatricula()
  const trancar = useTrancarMatricula()
  const encerrar = useEncerrarMatricula()
  const moverListaEspera = useMoverParaListaEspera()
  const pending =
    aprovar.isPending ||
    rejeitar.isPending ||
    trancar.isPending ||
    encerrar.isPending ||
    moverListaEspera.isPending

  const lista = data?.content ?? []
  const total = data?.totalElements ?? 0
  const isAguardando = filtro === 'AGUARDANDO_APROVACAO'

  // Se a página atual ficou fora do intervalo (ex.: última linha aprovada), volta para a última válida.
  React.useEffect(() => {
    if (data && data.totalPages > 0 && page > data.totalPages - 1) {
      setPage(data.totalPages - 1)
    }
  }, [data, page])

  // Troca de aba: aplica o filtro e reseta a página.
  function trocarFiltro(v: Filtro) {
    setFiltro(v)
    setPage(0)
  }

  function abrir(tipo: AcaoTipo, m: MatriculaDetalhada) {
    setMotivo('')
    setMotivoErro(null)
    setAcao({ tipo, m })
  }

  function fechar() {
    setAcao(null)
    setMotivo('')
    setMotivoErro(null)
  }

  async function confirmar() {
    if (!acao) return
    const { tipo, m } = acao
    try {
      if (tipo === 'aprovar') {
        await aprovar.mutateAsync(m.id)
        const msg =
          m.status === 'LISTA_ESPERA'
            ? 'Candidato alocado. 1ª mensalidade gerada e e-mail de acesso enviado.'
            : 'Matrícula aprovada. 1ª mensalidade gerada e e-mail de acesso enviado.'
        toast.success(msg)
      } else if (tipo === 'listaEspera') {
        await moverListaEspera.mutateAsync(m.id)
        toast.success('Candidato na lista de espera. E-mail enviado ao solicitante.')
      } else if (tipo === 'rejeitar') {
        const texto = motivo.trim()
        if (!texto) {
          setMotivoErro('Informe o motivo da rejeição.')
          return
        }
        await rejeitar.mutateAsync({ id: m.id, motivo: texto })
        toast.success('Solicitação rejeitada. E-mail enviado ao solicitante.')
      } else if (tipo === 'trancar') {
        await trancar.mutateAsync(m.id)
        toast.success('Matrícula trancada.')
      } else {
        await encerrar.mutateAsync(m.id)
        toast.success('Matrícula encerrada.')
      }
      fechar()
    } catch (e) {
      // Ex.: turma cheia no aprovar — mantém o diálogo aberto para nova tentativa.
      toast.error(mensagemErro(e))
    }
  }

  const info = acao ? textoAcao(acao.tipo, acao.m.alunoNome ?? 'este aluno') : null

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[26px] font-extrabold tracking-[-.015em] text-ink">Matrículas</h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          Todas as matrículas da escola — filtre por situação e decida o que fazer.
        </p>
      </header>

      <div className="relative w-full sm:max-w-sm">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
        />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail do aluno…"
          aria-label="Buscar aluno"
          className="pl-10"
        />
      </div>

      <Tabs value={filtro} onValueChange={(v) => trocarFiltro(v as Filtro)}>
        <div className="overflow-x-auto pb-1">
          <TabsList>
            {TABS.map((t) => {
              const ativo = t.value === filtro
              // Só a aba ativa exibe contagem (via totalElements) — contar as inativas exigiria N queries.
              const destaque = ativo && t.value === 'AGUARDANDO_APROVACAO' && total > 0
              return (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                  {ativo && data && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular',
                        destaque ? 'bg-accent text-ink' : 'bg-navy-50 text-ink-muted',
                      )}
                    >
                      {total}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
      </Tabs>

      {isLoading ? (
        <LoadingRows rows={isAguardando ? 3 : 6} />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar as matrículas"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : lista.length === 0 ? (
        isAguardando ? (
          <EmptyState
            icon={<Confetti size={30} className="text-success-dark" />}
            title="Nenhuma solicitação aguardando"
            description="Tudo revisado por aqui!"
            tintClass="bg-success-bg"
          />
        ) : (
          <EmptyState
            icon={<ClipboardText size={30} className="text-brand" />}
            title={filtro === 'TODAS' ? 'Nenhuma matrícula ainda' : 'Nenhuma matrícula neste filtro'}
            description="As matrículas da escola aparecem aqui conforme forem chegando."
            tintClass="bg-navy-50"
          />
        )
      ) : isAguardando ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">
            {total === 1 ? '1 pessoa quer' : `${total} pessoas querem`} entrar. Revise
            os dados e aprove ou rejeite — o solicitante recebe um e-mail em qualquer caso.
          </p>
          <div className="flex flex-col gap-3">
            {lista.map((m) => (
              <CardSolicitacao key={m.id} m={m} turma={turmaPorId.get(m.turmaId)} onAcao={abrir} />
            ))}
          </div>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Aluno</TH>
              <TH>Turma</TH>
              <TH>Data</TH>
              <TH>Responsável</TH>
              <TH>Status</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {lista.map((m, i) => {
              const s = statusMatricula[m.status]
              return (
                <TR key={m.id} className={i % 2 === 1 ? 'bg-[#FBFCFD]' : undefined}>
                  <TD>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink">{m.alunoNome ?? 'Aluno'}</div>
                      {m.alunoEmail && <div className="text-[13px] text-ink-subtle">{m.alunoEmail}</div>}
                      {m.status === 'REJEITADA' && m.motivoRejeicao && (
                        <div className="mt-1 text-[12px] text-ink-subtle">Motivo: {m.motivoRejeicao}</div>
                      )}
                    </div>
                  </TD>
                  <TD className="text-ink-muted">{m.turmaNome ?? '—'}</TD>
                  <TD className="whitespace-nowrap tabular text-ink-muted">{formatDate(m.dataMatricula)}</TD>
                  <TD>
                    <ResponsavelDetalhes m={m} />
                  </TD>
                  <TD>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </TD>
                  <TD>
                    <AcoesLinha m={m} onAcao={abrir} />
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}

      {!isLoading && !isError && lista.length > 0 && (
        <Paginacao page={data?.page ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
      )}

      <Dialog open={!!acao} onOpenChange={(o) => !o && fechar()}>
        {acao && info && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{info.titulo}</DialogTitle>
              <DialogDescription>
                Turma {acao.m.turmaNome ?? '—'} · solicitada em {formatDate(acao.m.dataMatricula)}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="flex flex-col gap-4">
              {acao.tipo === 'aprovar' && (
                <AvisoBox tone="info">
                  Ao aprovar, o sistema gera a 1ª mensalidade (pró-rata) e envia o 1º acesso ao aluno por e-mail.
                </AvisoBox>
              )}

              {acao.tipo === 'rejeitar' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="motivo-rejeicao">Motivo da rejeição</Label>
                    <Textarea
                      id="motivo-rejeicao"
                      rows={3}
                      value={motivo}
                      invalid={!!motivoErro}
                      placeholder="Ex.: turma incompatível com o nível informado."
                      onChange={(e) => {
                        setMotivo(e.target.value)
                        if (motivoErro) setMotivoErro(null)
                      }}
                    />
                    {motivoErro && <p className="text-[13px] font-medium text-danger">{motivoErro}</p>}
                  </div>
                  <AvisoBox tone="info">Um e-mail será enviado ao solicitante com este motivo.</AvisoBox>
                </div>
              )}

              {acao.tipo === 'listaEspera' && (
                <AvisoBox tone="info">
                  O candidato é avisado por e-mail de que entrou na lista de espera. Quando abrir vaga
                  na turma, você recebe um alerta para contatá-lo e alocar.
                </AvisoBox>
              )}

              {(acao.tipo === 'trancar' || acao.tipo === 'encerrar') && (
                <AvisoBox tone="warning">Novas mensalidades deixam de ser geradas; o histórico é mantido.</AvisoBox>
              )}
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button variant={info.variant} loading={pending} onClick={confirmar}>
                {info.confirmar}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
