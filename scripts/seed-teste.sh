#!/usr/bin/env bash
# =============================================================================
# Seed de dados de TESTE do EscolaIdiomas -- idempotente, via API real.
#
# Dirige os endpoints reais (respeita as regras de negocio: pro-rata, geracao de
# mensalidade, 1o acesso, etc.). Reexecutavel: cada entidade e' resolvida antes de
# criar (nao duplica) e as transicoes de status toleram "ja feito".
#
# Obs.: os textos enviados a API sao ASCII de proposito -- o pipeline
# Git Bash -> curl -> Spring corrompe UTF-8 no corpo (quebra o JSON).
#
# Pre-requisitos:
#   - Backend em localhost:8080 (com JOB_TRIGGER_SECRET conhecido).
#   - Containers docker escolaidiomas-db + escolaidiomas-mailhog de pe.
#   - Conta de gestao ja semeada (gestao.verify@escolaidiomas.local / Gestor@123).
#
# Uso:   bash scripts/seed-teste.sh
#        BASE=http://localhost:8080 JOB_SECRET=dev-job-secret bash scripts/seed-teste.sh
# =============================================================================
set -u

BASE="${BASE:-http://localhost:8080}"
JOB_SECRET="${JOB_SECRET:-dev-job-secret}"
DB_CONTAINER="${DB_CONTAINER:-escolaidiomas-db}"

# Contas canonicas de teste (casam com o painel dev da tela de login).
GESTAO_EMAIL="gestao.verify@escolaidiomas.local"; GESTAO_SENHA="Gestor@123"
PROF_SENHA="Prof@123"
ALUNO_SENHA="Aluno@123"
ALUNO_CANONICO="aluno.joao@escola.local"

COMP_ATUAL="2026-07"
COMP_ANTERIOR="2026-06"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
R="$TMP/resp.json"
GTOKEN=""

# --- helpers ----------------------------------------------------------------
jget() { python -c "import sys,json
try:
  d=json.load(sys.stdin); print($1)
except Exception:
  pass" 2>/dev/null; }

# api METHOD PATH TOKEN [BODY] [EXTRA_HEADER] -> define CODE, corpo em $R
api() {
  local m="$1" p="$2" t="$3" b="${4:-}" h="${5:-}"
  local a=(-s -o "$R" -w '%{http_code}' -X "$m" "$BASE$p" -H 'Content-Type: application/json')
  [ -n "$t" ] && a+=(-H "Authorization: Bearer $t")
  [ -n "$h" ] && a+=(-H "$h")
  [ -n "$b" ] && a+=(-d "$b")
  CODE=$(curl "${a[@]}")
}

dbtoken() {
  docker exec "$DB_CONTAINER" psql -U postgres -d escola_idiomas -t -A -c \
    "SELECT t.token FROM tokens_verificacao t JOIN usuarios u ON u.id=t.usuario_id \
     WHERE u.email='$1' AND t.tipo='ATIVACAO' AND t.utilizado=false \
     ORDER BY t.data_expiracao DESC LIMIT 1" 2>/dev/null | tr -d '[:space:]'
}

set_senha() {  # set_senha EMAIL SENHA
  local tok; tok=$(dbtoken "$1")
  [ -z "$tok" ] && return 0
  api POST /api/auth/definir-senha "" "{\"token\":\"$tok\",\"novaSenha\":\"$2\"}"
}

ok() { printf '   [ok] %s\n' "$1"; }
skip() { printf '   [--] %s\n' "$1"; }

# --- 0) login gestao --------------------------------------------------------
echo "» login gestao ($GESTAO_EMAIL)"
api POST /api/auth/login "" "{\"email\":\"$GESTAO_EMAIL\",\"password\":\"$GESTAO_SENHA\"}"
GTOKEN=$(jget "d['token']" < "$R")
if [ -z "$GTOKEN" ]; then
  echo "   [x] nao consegui logar como gestao (code $CODE). A conta existe? Abortando."; exit 1
fi
ok "autenticado"

# --- RESET opcional (RESET=1): base pristina, preservando as contas de gestao --
if [ "${RESET:-0}" = 1 ]; then
  echo "» RESET: limpando dados de teste (preserva contas de gestao)"
  docker exec "$DB_CONTAINER" psql -U postgres -d escola_idiomas -q -c \
    "DELETE FROM avaliacoes; DELETE FROM presencas; DELETE FROM aulas; \
     DELETE FROM mensalidades; DELETE FROM matriculas; DELETE FROM despesas; \
     DELETE FROM turmas; DELETE FROM alunos; DELETE FROM professores; \
     DELETE FROM responsaveis; \
     DELETE FROM tokens_verificacao WHERE usuario_id IN (SELECT id FROM usuarios WHERE role <> 'GESTAO'); \
     DELETE FROM usuarios WHERE role <> 'GESTAO'; \
     DELETE FROM semestres;" >/dev/null 2>&1 \
    && ok "banco limpo (apenas gestao preservada)" || skip "reset falhou"
fi

# --- 1) semestres -----------------------------------------------------------
echo "» semestres"
ensure_semestre() { # ref inicio fim
  api GET /api/semestres "$GTOKEN"
  if jget "any(s['referencia']=='$1' for s in d)" < "$R" | grep -qi true; then
    skip "semestre $1 ja existe"
  else
    api POST /api/semestres "$GTOKEN" "{\"referencia\":\"$1\",\"dataInicio\":\"$2\",\"dataFim\":\"$3\"}"
    [ "$CODE" = 201 ] && ok "semestre $1 criado" || skip "semestre $1 [$CODE]"
  fi
}
ensure_semestre "2026-1" "2026-01-06" "2026-06-30"
ensure_semestre "2026-2" "2026-07-01" "2026-12-15"

# --- 2) professores ---------------------------------------------------------
echo "» professores"
PID=""
ensure_professor() { # nome email idiomas telefone cpf
  api GET /api/professores "$GTOKEN"
  PID=$(jget "next((p['id'] for p in d if p['email']=='$2'), '')" < "$R")
  if [ -n "$PID" ]; then skip "professor $2 ja existe"; return; fi
  api POST /api/professores "$GTOKEN" \
    "{\"nome\":\"$1\",\"email\":\"$2\",\"cpf\":\"$5\",\"telefone\":\"$4\",\"idiomasHabilitados\":\"$3\"}"
  PID=$(jget "d['id']" < "$R")
  if [ -n "$PID" ]; then set_senha "$2" "$PROF_SENHA"; ok "professor $1 ($2) criado + senha"; else skip "professor $1 [$CODE] $(head -c 120 "$R")"; fi
}
ensure_professor "Ana Souza"   "prof.ana@escola.local"   "Ingles, Espanhol" "48999990001" "30000000001"; PID_ANA="$PID"
ensure_professor "Bruno Lima"  "prof.bruno@escola.local" "Frances"          "48999990002" "30000000002"; PID_BRUNO="$PID"
ensure_professor "Carla Dias"  "prof.carla@escola.local" "Ingles, Alemao"   "48999990003" "30000000003"; PID_CARLA="$PID"

# --- 3) turmas --------------------------------------------------------------
echo "» turmas"
TID=""
ensure_turma() { # nome professorId idioma nivel dias ini fim valor lot
  api GET /api/gestao/turmas "$GTOKEN"
  TID=$(jget "next((t['id'] for t in d if t['nome']=='$1'), '')" < "$R")
  if [ -n "$TID" ]; then skip "turma '$1' ja existe"; return; fi
  api POST /api/turmas "$GTOKEN" \
    "{\"professorId\":\"$2\",\"nome\":\"$1\",\"idioma\":\"$3\",\"nivel\":\"$4\",\"diasSemana\":\"$5\",\"horaInicio\":\"$6\",\"horaFim\":\"$7\",\"valorMensalidade\":$8,\"lotacaoMaxima\":$9}"
  TID=$(jget "d['id']" < "$R")
  [ -n "$TID" ] && ok "turma '$1' criada" || skip "turma '$1' [$CODE] $(head -c 120 "$R")"
}
ensure_turma "Ingles A1 - Noite"   "$PID_ANA"   "Ingles"   "A1"   "SEG,QUA" "19:00" "20:30" "320.00" 12; T_INGA1="$TID"
ensure_turma "Ingles B2 - Manha"   "$PID_ANA"   "Ingles"   "B2"   "TER,QUI" "08:00" "09:30" "360.00" 10; T_INGB2="$TID"
ensure_turma "Espanhol B1 - Noite" "$PID_ANA"   "Espanhol" "B1"   "SEG,QUA" "20:30" "22:00" "340.00" 12; T_ESP="$TID"
ensure_turma "Frances A2 - Tarde"  "$PID_BRUNO" "Frances"  "A2"   "SEX"     "14:00" "16:00" "380.00" 8;  T_FRA="$TID"
ensure_turma "Alemao A1 - Manha"   "$PID_CARLA" "Alemao"   "A1"   "TER,QUI" "07:00" "08:30" "400.00" 6;  T_ALE="$TID"
ensure_turma "Ingles Kids - Sab"   "$PID_CARLA" "Ingles"   "Kids" "SAB"     "10:00" "11:00" "300.00" 10; T_KIDS="$TID"

# desativa a turma Kids (para exibir estado "Inativa")
if [ -n "${T_KIDS:-}" ]; then
  api PUT "/api/turmas/$T_KIDS" "$GTOKEN" \
    "{\"professorId\":\"$PID_CARLA\",\"nome\":\"Ingles Kids - Sab\",\"idioma\":\"Ingles\",\"nivel\":\"Kids\",\"diasSemana\":\"SAB\",\"horaInicio\":\"10:00\",\"horaFim\":\"11:00\",\"valorMensalidade\":300.00,\"lotacaoMaxima\":10,\"ativa\":false}"
  [ "$CODE" = 200 ] && ok "turma Kids marcada como inativa"
fi

# --- 4) matriculas ----------------------------------------------------------
echo "» matriculas (todos os status)"
MID=""; M_CRIADA=0
ensure_matricula() { # email nome dataNasc cpf turmaId [respNome respCpf]
  M_CRIADA=0
  api GET /api/matriculas "$GTOKEN"
  MID=$(jget "next((m['id'] for m in d if m['alunoEmail']=='$1' and m['turmaId']=='$5'), '')" < "$R")
  local st; st=$(jget "next((m['status'] for m in d if m['alunoEmail']=='$1' and m['turmaId']=='$5'), '')" < "$R")
  if [ -n "$MID" ]; then skip "matricula $2 -> turma ja existe ($st)"; return; fi
  local resp=""
  if [ -n "${6:-}" ]; then
    resp=",\"responsavel\":{\"nome\":\"$6\",\"cpf\":\"$7\",\"telefone\":\"48988880000\",\"email\":\"resp.$1\"}"
  fi
  api POST /api/matriculas "" \
    "{\"turmaId\":\"$5\",\"aluno\":{\"nome\":\"$2\",\"email\":\"$1\",\"dataNascimento\":\"$3\",\"cpf\":\"$4\",\"telefone\":\"48977770000\"}$resp}"
  MID=$(jget "d['id']" < "$R")
  if [ -n "$MID" ]; then M_CRIADA=1; ok "matricula $2 criada"; else skip "matricula $2 [$CODE] $(head -c 120 "$R")"; fi
}
transicao() { # matriculaId acao [motivo]  -- tolera "ja feito"
  local body=""; [ "$2" = "rejeitar" ] && body="{\"motivo\":\"${3:-Sem vaga no horario solicitado.}\"}"
  api POST "/api/matriculas/$1/$2" "$GTOKEN" "$body"
  [ "$CODE" = 200 ] && ok "  -> $2" || skip "  -> $2 [$CODE]"
}

# ATIVA + boletim (aluno canonico). Fica numa turma da prof.ana (T_INGB2) para
# que ela possa lancar chamada/notas. Limpamos matriculas antigas dele (cascade
# remove mensalidades/presencas/notas) para o estado ser deterministico a cada run.
docker exec "$DB_CONTAINER" psql -U postgres -d escola_idiomas -q -c \
  "DELETE FROM matriculas mt USING usuarios u WHERE mt.aluno_id=u.id AND u.email='$ALUNO_CANONICO';" >/dev/null 2>&1
ensure_matricula "$ALUNO_CANONICO" "Joao Pereira" "1996-03-12" "20000000001" "$T_INGB2"
if [ "$M_CRIADA" = 1 ]; then transicao "$MID" aprovar; set_senha "$ALUNO_CANONICO" "$ALUNO_SENHA" && ok "  -> senha do aluno canonico definida"; fi
MID_JOAO="$MID"

# Enche a turma de Alemao (6/6 => "Cheia")
i=1
for nome in "Helena Alves" "Igor Ramos" "Julia Costa" "Kaique Nunes" "Lara Melo" "Miguel Rocha"; do
  ensure_matricula "ale$i@escola.local" "$nome" "1998-0$i-1$i" "2000000010$i" "$T_ALE"
  [ "$M_CRIADA" = 1 ] && transicao "$MID" aprovar
  i=$((i+1))
done

# Outras ATIVA (espalha o financeiro)
ensure_matricula "clara@escola.local" "Clara Dias"   "1995-09-21" "20000000021" "$T_INGB2"
[ "$M_CRIADA" = 1 ] && transicao "$MID" aprovar; MID_CLARA="$MID"
ensure_matricula "diego@escola.local" "Diego Santos" "1994-02-08" "20000000022" "$T_ESP"
[ "$M_CRIADA" = 1 ] && transicao "$MID" aprovar
ensure_matricula "elis@escola.local"  "Elis Faria"   "1997-11-30" "20000000023" "$T_FRA"
[ "$M_CRIADA" = 1 ] && transicao "$MID" aprovar

# AGUARDANDO_APROVACAO (3) -- inclui um MENOR com responsavel
ensure_matricula "bia@escola.local"   "Beatriz Lima"  "2014-05-20" "20000000031" "$T_INGB2" "Marcos Lima" "40000000001"
ensure_matricula "pedro@escola.local" "Pedro Gomes"   "1990-07-15" "20000000032" "$T_ESP"
ensure_matricula "sofia@escola.local" "Sofia Martins" "1992-04-03" "20000000033" "$T_FRA"

# REJEITADA
ensure_matricula "rafael@escola.local" "Rafael Souza" "1993-08-19" "20000000041" "$T_ESP"
[ "$M_CRIADA" = 1 ] && transicao "$MID" rejeitar "Turma incompativel com o nivel informado."

# TRANCADA
ensure_matricula "lucas@escola.local" "Lucas Barros" "1991-12-05" "20000000042" "$T_INGB2"
if [ "$M_CRIADA" = 1 ]; then transicao "$MID" aprovar; transicao "$MID" trancar; fi

# ENCERRADA
ensure_matricula "marina@escola.local" "Marina Reis" "1989-06-27" "20000000043" "$T_ESP"
if [ "$M_CRIADA" = 1 ]; then transicao "$MID" aprovar; transicao "$MID" encerrar; fi

# --- 5) mensalidades: gera mes anterior (fica ATRASADA) ---------------------
echo "» mensalidades"
api POST "/jobs/gerar-mensalidades?ano=2026&mes=6" "" "" "X-Job-Secret: $JOB_SECRET"
GERADAS=$(jget "d.get('geradas','?')" < "$R")
ok "geracao de $COMP_ANTERIOR (vence 10/06 -> atrasadas): geradas=$GERADAS [$CODE]"

# baixa: paga a mensalidade de julho do Joao (=> PAGA no mes atual)
darbaixa_por_matricula() { # competencia matriculaId [dataPagamento]
  api GET "/api/mensalidades?competencia=$1" "$GTOKEN"
  local mid; mid=$(jget "next((x['id'] for x in d if x['matriculaId']=='$2' and x['situacao'] in ('ABERTA','ATRASADA')), '')" < "$R")
  [ -z "$mid" ] && { skip "sem mensalidade em aberto p/ baixa em $1"; return; }
  local q=""; [ -n "${3:-}" ] && q="?dataPagamento=$3"
  api POST "/api/mensalidades/$mid/baixa$q" "$GTOKEN"
  [ "$CODE" = 200 ] && ok "baixa registrada em $1" || skip "baixa $1 [$CODE]"
}
[ -n "${MID_JOAO:-}" ]  && darbaixa_por_matricula "$COMP_ATUAL" "$MID_JOAO"
[ -n "${MID_CLARA:-}" ] && darbaixa_por_matricula "$COMP_ATUAL" "$MID_CLARA"

# Simula atraso: backdata o vencimento da pro-rata de julho de 2 alunos. A API nao
# gera "atrasada" hoje (o vencimento cai no futuro), entao ajustamos direto no banco
# -- exclusivo de dados de teste, para exibir multa/mora no painel financeiro.
docker exec "$DB_CONTAINER" psql -U postgres -d escola_idiomas -q -c \
  "UPDATE mensalidades m SET vencimento='2026-06-12' \
   FROM matriculas mt, usuarios u \
   WHERE m.matricula_id=mt.id AND mt.aluno_id=u.id \
     AND u.email IN ('diego@escola.local','elis@escola.local') \
     AND m.competencia='$COMP_ATUAL' AND m.status='ABERTA';" >/dev/null 2>&1 \
  && ok "atraso simulado (Diego, Elis -> venc. 12/06, com multa+mora)"

# --- 6) despesas (competencia atual, 4 categorias) --------------------------
echo "» despesas ($COMP_ATUAL)"
ensure_despesa() { # descricao categoria valor data [professorId]
  api GET "/api/despesas?competencia=$COMP_ATUAL" "$GTOKEN"
  if jget "any(x['descricao']=='$1' for x in d)" < "$R" | grep -qi true; then skip "despesa '$1' ja existe"; return; fi
  local pj=""; [ -n "${5:-}" ] && pj=",\"professorId\":\"$5\""
  api POST /api/despesas "$GTOKEN" "{\"descricao\":\"$1\",\"categoria\":\"$2\",\"valor\":$3,\"data\":\"$4\"$pj}"
  [ "$CODE" = 201 ] && ok "despesa '$1' criada" || skip "despesa '$1' [$CODE]"
}
ensure_despesa "Conta de luz - julho"     "LUZ"               "284.90"  "2026-07-05"
ensure_despesa "Aluguel da sede - julho"  "ALUGUEL"           "2500.00" "2026-07-05"
ensure_despesa "Repasse de aulas - julho" "REPASSE_PROFESSOR" "1500.00" "2026-07-05" "$PID_ANA"
ensure_despesa "Material de escritorio"   "OUTROS"            "119.90"  "2026-07-08"

# --- 7) chamada + notas do Joao (=> boletim aprovado) -----------------------
echo "» chamada + notas (boletim do aluno canonico)"
api POST /api/auth/login "" "{\"email\":\"prof.ana@escola.local\",\"password\":\"$PROF_SENHA\"}"
PTOKEN=$(jget "d['token']" < "$R")
if [ -n "$PTOKEN" ] && [ -n "${MID_JOAO:-}" ]; then
  api GET "/api/boletins?matriculaId=$MID_JOAO" "$PTOKEN"
  TEM_NOTA=$(jget "1 if d.get('notaMidterm') is not None else 0" < "$R")
  if [ "$TEM_NOTA" = 1 ]; then
    skip "boletim do Joao ja tem notas"
  else
    api POST /api/chamadas "$PTOKEN" "{\"turmaId\":\"$T_INGB2\",\"data\":\"2026-07-01\",\"presencas\":[{\"matriculaId\":\"$MID_JOAO\",\"presente\":true}]}"
    api POST /api/chamadas "$PTOKEN" "{\"turmaId\":\"$T_INGB2\",\"data\":\"2026-07-03\",\"presencas\":[{\"matriculaId\":\"$MID_JOAO\",\"presente\":true}]}"
    api POST /api/notas "$PTOKEN" "{\"matriculaId\":\"$MID_JOAO\",\"tipo\":\"MIDTERM\",\"nota\":85}"
    api POST /api/notas "$PTOKEN" "{\"matriculaId\":\"$MID_JOAO\",\"tipo\":\"FINAL\",\"nota\":92}"
    ok "chamada (2 aulas) + notas 85/92 lancadas"
  fi
else
  skip "professor Ana sem senha ainda -- rode de novo para lancar o boletim"
fi

# --- resumo -----------------------------------------------------------------
echo ""
echo "=============================================================="
echo " SEED CONCLUIDO -- dados de teste prontos."
echo "--------------------------------------------------------------"
api GET "/api/gestao/dashboard?competencia=$COMP_ATUAL" "$GTOKEN"
echo "  Dashboard $(jget "d['competencia']" < "$R"): recebido R\$$(jget "d['recebido']" < "$R") | aberto R\$$(jget "d['emAberto']" < "$R") | atraso R\$$(jget "d['emAtraso']" < "$R") | inadimplentes $(jget "d['inadimplentes']" < "$R") | pendentes $(jget "d['solicitacoesPendentes']" < "$R")"
echo "--------------------------------------------------------------"
echo " CONTAS DE TESTE:"
echo "   Gestao    -> $GESTAO_EMAIL / $GESTAO_SENHA"
echo "   Professor -> prof.ana@escola.local / $PROF_SENHA"
echo "   Aluno     -> $ALUNO_CANONICO / $ALUNO_SENHA"
echo "=============================================================="
