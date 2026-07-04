import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { roleHome } from '@/auth/roleHome'
import { SplashScreen } from '@/components/SplashScreen'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AlunoLayout } from '@/layouts/AlunoLayout'
import { ProfessorLayout } from '@/layouts/ProfessorLayout'
import { GestaoLayout } from '@/layouts/GestaoLayout'

import LoginPage from '@/pages/acesso/LoginPage'
import EsqueciSenhaPage from '@/pages/acesso/EsqueciSenhaPage'
import DefinirSenhaPage from '@/pages/acesso/DefinirSenhaPage'
import MatriculaPublicaPage from '@/pages/matricula/MatriculaPublicaPage'

import AlunoHomePage from '@/pages/aluno/AlunoHomePage'
import AlunoTurmasPage from '@/pages/aluno/AlunoTurmasPage'
import AlunoBoletimPage from '@/pages/aluno/AlunoBoletimPage'
import AlunoMensalidadesPage from '@/pages/aluno/AlunoMensalidadesPage'

import ProfessorTurmasPage from '@/pages/professor/ProfessorTurmasPage'
import ProfessorAlunosPage from '@/pages/professor/ProfessorAlunosPage'
import ChamadaPage from '@/pages/professor/ChamadaPage'
import NotasPage from '@/pages/professor/NotasPage'
import ProfessorBoletimTurmaPage from '@/pages/professor/ProfessorBoletimTurmaPage'
import ProfessorBoletimPage from '@/pages/professor/ProfessorBoletimPage'

import GestaoInicioPage from '@/pages/gestao/GestaoInicioPage'
import GestaoMatriculasPage from '@/pages/gestao/GestaoMatriculasPage'
import GestaoTurmasPage from '@/pages/gestao/GestaoTurmasPage'
import GestaoProfessoresPage from '@/pages/gestao/GestaoProfessoresPage'
import GestaoFinanceiroPage from '@/pages/gestao/GestaoFinanceiroPage'
import GestaoSemestresPage from '@/pages/gestao/GestaoSemestresPage'
import NotFoundPage from '@/pages/NotFoundPage'

/** Redireciona a raiz conforme o estado da sessão. */
function IndexRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth()
  if (isLoading) return <SplashScreen />
  if (isAuthenticated && user) return <Navigate to={roleHome[user.role]} replace />
  return <Navigate to="/login" replace />
}

/** Rotas públicas de acesso: usuário logado é mandado para a sua área. */
function PublicOnly() {
  const { user, isLoading, isAuthenticated } = useAuth()
  if (isLoading) return <SplashScreen />
  if (isAuthenticated && user) return <Navigate to={roleHome[user.role]} replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />

      {/* Acesso (público) */}
      <Route element={<PublicOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/definir-senha" element={<DefinirSenhaPage />} />
        </Route>
      </Route>

      {/* Matrícula pública (via link) */}
      <Route path="/matricula" element={<MatriculaPublicaPage />} />

      {/* Área do aluno */}
      <Route element={<ProtectedRoute roles={['ALUNO']} />}>
        <Route element={<AlunoLayout />}>
          <Route path="/aluno" element={<AlunoHomePage />} />
          <Route path="/aluno/turmas" element={<AlunoTurmasPage />} />
          <Route path="/aluno/boletim" element={<AlunoBoletimPage />} />
          <Route path="/aluno/financeiro" element={<AlunoMensalidadesPage />} />
        </Route>
      </Route>

      {/* Área do professor */}
      <Route element={<ProtectedRoute roles={['PROFESSOR']} />}>
        <Route element={<ProfessorLayout />}>
          <Route path="/professor" element={<ProfessorTurmasPage />} />
          <Route path="/professor/chamada" element={<ChamadaPage />} />
          <Route path="/professor/turmas/:turmaId/chamada" element={<ChamadaPage />} />
          <Route path="/professor/notas" element={<NotasPage />} />
          <Route path="/professor/turmas/:turmaId/notas" element={<NotasPage />} />
          <Route path="/professor/boletins" element={<ProfessorBoletimTurmaPage />} />
          <Route path="/professor/turmas/:turmaId/boletim" element={<ProfessorBoletimTurmaPage />} />
          <Route path="/professor/turmas/:turmaId/alunos" element={<ProfessorAlunosPage />} />
          <Route path="/professor/boletim/:matriculaId" element={<ProfessorBoletimPage />} />
        </Route>
      </Route>

      {/* Área da gestão */}
      <Route element={<ProtectedRoute roles={['GESTAO']} />}>
        <Route element={<GestaoLayout />}>
          <Route path="/gestao" element={<GestaoInicioPage />} />
          <Route path="/gestao/matriculas" element={<GestaoMatriculasPage />} />
          <Route path="/gestao/turmas" element={<GestaoTurmasPage />} />
          <Route path="/gestao/professores" element={<GestaoProfessoresPage />} />
          <Route path="/gestao/financeiro" element={<GestaoFinanceiroPage />} />
          <Route path="/gestao/semestres" element={<GestaoSemestresPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
