package com.henrique.escolaidiomas.application.matricula.usecase;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.usecase.ProvisionarPrimeiroAcessoUseCase;
import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.identity.enums.StatusUsuario;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-06 / RN-02: a gestao aprova a matricula. Respeita a lotacao (RN-07), provisiona
 * o 1o acesso do aluno se a conta ainda esta pendente (RN-39) e gera a 1a mensalidade
 * pro-rata com vencimento no ato (RN-03/22/28).
 */
@Service
@RequiredArgsConstructor
public class AprovarMatriculaUseCase {

    private final MatriculaRepository matriculaRepository;
    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProvisionarPrimeiroAcessoUseCase provisionarPrimeiroAcesso;
    private final MensalidadeRepository mensalidadeRepository;

    @Transactional
    public MatriculaDTO execute(UUID matriculaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId)
                .orElseThrow(() -> new NegocioException("Matricula nao encontrada."));

        Turma turma = turmaRepository.buscarPorId(matricula.getTurmaId())
                .orElseThrow(() -> new NegocioException("Turma da matricula nao encontrada."));
        if (!turma.isAtiva()) {
            throw new NegocioException("Turma inativa.");
        }
        if (matriculaRepository.contarAtivasPorTurma(turma.getId()) >= turma.getLotacaoMaxima()) {
            throw new NegocioException(
                    "Turma cheia: lotacao maxima de " + turma.getLotacaoMaxima() + " atingida (RN-07).");
        }

        matricula.aprovar();

        Usuario aluno = usuarioRepository.buscarPorId(matricula.getAlunoId())
                .orElseThrow(() -> new NegocioException("Aluno da matricula nao encontrado."));
        if (aluno.getStatus() == StatusUsuario.PENDENTE_VERIFICACAO) {
            provisionarPrimeiroAcesso.execute(aluno);
        }

        // RN-22/28: a pro-rata e' calculada e vence na EFETIVACAO (aprovacao), nao na
        // solicitacao publica. Usar a data da solicitacao faria a mensalidade nascer
        // vencida (com multa/mora) sempre que a aprovacao ocorresse dias depois.
        Mensalidade primeira = Mensalidade.primeira(
                matricula.getId(), turma.getValorMensalidade(), LocalDate.now());
        mensalidadeRepository.salvar(primeira);

        matriculaRepository.salvar(matricula);
        return MatriculaDTO.de(matricula);
    }
}
