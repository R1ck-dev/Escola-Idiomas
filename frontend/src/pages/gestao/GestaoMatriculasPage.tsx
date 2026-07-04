import * as React from 'react'
import { useState } from 'react'
import {
  Check,
  ClipboardText,
  Confetti,
  Info,
  Lock,
  Prohibit,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  useRejeitarMatricula,
  useTrancarMatricula,
} from '@/api/gestao'
import { mensagemErro } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { statusMatricula } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { MatriculaDetalhada, StatusMatricula } from '@/types/api'

type Filtro = 'TODAS' | StatusMatricula
type AcaoTipo = 'aprovar' | 'rejeitar' | 'trancar' | 'encerrar'

const TABS: { value: Filtro; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando' },
  { value: 'ATIVA', label: 'Ativa' },
  { value: 'TRANCADA', label: 'Trancada' },
  { value: 'ENCERRADA', label: 'Encerrada' },
  { value: 'REJEITADA', label: 'Rejeitada' },
]

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
  return <div className="text-right text-sm text-ink-subtle">—</div>
}

/** Célula Responsável: nome do responsável + selo "menor" quando aplicável. */
function CelulaResponsavel({ m }: { m: MatriculaDetalhada }) {
  if (!m.menorIdade) return <span className="text-ink-subtle">—</span>
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink">{m.responsavelNome ?? '—'}</span>
      <Badge tone="neutralAlt" dot={false} className="px-2 py-0.5 text-[11px]">
        menor
      </Badge>
    </div>
  )
}

export default function GestaoMatriculasPage() {
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [acao, setAcao] = useState<{ tipo: AcaoTipo; m: MatriculaDetalhada } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [motivoErro, setMotivoErro] = useState<string | null>(null)

  // Query filtrada (tabela) + lista completa para as contagens das abas.
  const { data, isLoading, isError, refetch } = useMatriculas(filtro === 'TODAS' ? undefined : filtro)
  const todas = useMatriculas().data ?? []

  const aprovar = useAprovarMatricula()
  const rejeitar = useRejeitarMatricula()
  const trancar = useTrancarMatricula()
  const encerrar = useEncerrarMatricula()
  const pending = aprovar.isPending || rejeitar.isPending || trancar.isPending || encerrar.isPending

  const lista = data ?? []

  const contagem = (t: Filtro): number =>
    t === 'TODAS' ? todas.length : todas.filter((m) => m.status === t).length

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
        toast.success('Matrícula aprovada. 1ª mensalidade gerada e e-mail de acesso enviado.')
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

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
        <div className="overflow-x-auto pb-1">
          <TabsList>
            {TABS.map((t) => {
              const n = contagem(t.value)
              const destaque = t.value === 'AGUARDANDO_APROVACAO' && n > 0
              return (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular',
                      destaque ? 'bg-accent text-ink' : 'bg-navy-50 text-ink-muted',
                    )}
                  >
                    {n}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
      </Tabs>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar as matrículas"
          description="Tente novamente em instantes."
          onRetry={() => refetch()}
        />
      ) : lista.length === 0 ? (
        filtro === 'AGUARDANDO_APROVACAO' ? (
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
                    <CelulaResponsavel m={m} />
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
