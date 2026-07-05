package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.usecase.ConsultarBoletimDoAlunoUseCase;
import com.henrique.escolaidiomas.application.academico.usecase.ListarTurmasDoAlunoUseCase;
import com.henrique.escolaidiomas.application.financeiro.usecase.ConsultarMensalidadesDoAlunoUseCase;
import com.henrique.escolaidiomas.application.identity.dto.AlunoDetalheDTO;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import lombok.RequiredArgsConstructor;

/**
 * Detalhe do aluno para a gestao (GET /api/alunos/{id}). Monta os dados cadastrais e
 * o responsavel, e reusa as consultas da area do aluno (turmas, mensalidades, boletim)
 * — que ja recebem o alunoId — para evitar duplicar logica.
 */
@Service
@RequiredArgsConstructor
public class BuscarAlunoDetalheUseCase {

    private final UsuarioRepository usuarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final ListarTurmasDoAlunoUseCase listarTurmasDoAluno;
    private final ConsultarMensalidadesDoAlunoUseCase consultarMensalidadesDoAluno;
    private final ConsultarBoletimDoAlunoUseCase consultarBoletimDoAluno;

    public AlunoDetalheDTO execute(UUID alunoId) {
        Usuario usuario = usuarioRepository.buscarPorId(alunoId).orElse(null);
        if (!(usuario instanceof Aluno aluno)) {
            throw new NegocioException("Aluno nao encontrado.");
        }

        String respNome = null, respCpf = null, respTelefone = null, respEmail = null;
        if (aluno.getResponsavelId() != null) {
            Responsavel resp = responsavelRepository.buscarPorId(aluno.getResponsavelId()).orElse(null);
            if (resp != null) {
                respNome = resp.getNome();
                respCpf = resp.getCpf();
                respTelefone = resp.getTelefone();
                respEmail = resp.getEmail();
            }
        }

        return new AlunoDetalheDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getCpf(),
                aluno.getRg(),
                aluno.getTelefone(),
                aluno.getDataNascimento(),
                aluno.getEndereco(),
                aluno.getObservacoes(),
                aluno.isMenor(),
                respNome,
                respCpf,
                respTelefone,
                respEmail,
                listarTurmasDoAluno.execute(alunoId),
                consultarMensalidadesDoAluno.execute(alunoId),
                consultarBoletimDoAluno.execute(alunoId, null));
    }
}
