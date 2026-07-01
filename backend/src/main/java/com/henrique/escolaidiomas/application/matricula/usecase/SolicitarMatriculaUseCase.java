package com.henrique.escolaidiomas.application.matricula.usecase;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.DadosAlunoInput;
import com.henrique.escolaidiomas.application.matricula.dto.DadosResponsavelInput;
import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.application.matricula.dto.SolicitarMatriculaInput;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * US-04 / RN-01: o candidato solicita a matricula (endpoint publico). A conta do
 * aluno reaproveita o cadastro por CPF (RN-08); se menor, exige responsavel (RN-18).
 * A matricula nasce AGUARDANDO_APROVACAO.
 */
@Service
@RequiredArgsConstructor
public class SolicitarMatriculaUseCase {

    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final MatriculaRepository matriculaRepository;

    @Transactional
    public MatriculaDTO execute(SolicitarMatriculaInput input) {
        Turma turma = turmaRepository.buscarPorId(input.turmaId())
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.isAtiva()) {
            throw new NegocioException("Turma inativa; nao aceita novas matriculas.");
        }

        DadosAlunoInput dados = input.aluno();
        if (dados == null || dados.cpf() == null || dados.cpf().isBlank()) {
            throw new NegocioException("O CPF do aluno e' obrigatorio.");
        }

        // Reuso por CPF (RN-08): se ja existe aluno, usa o mesmo cadastro/conta.
        Aluno aluno = (Aluno) usuarioRepository.buscarAlunoPorCpf(dados.cpf()).orElse(null);
        if (aluno == null) {
            aluno = criarNovoAluno(dados, input.responsavel());
        }

        if (matriculaRepository.existeAtivaOuPendente(aluno.getId(), turma.getId())) {
            throw new NegocioException("Este aluno ja possui matricula ativa ou em analise nesta turma.");
        }

        Matricula matricula = matriculaRepository.salvar(
                new Matricula(null, aluno.getId(), turma.getId(), LocalDate.now()));
        return MatriculaDTO.de(matricula);
    }

    private Aluno criarNovoAluno(DadosAlunoInput dados, DadosResponsavelInput respInput) {
        if (dados.nome() == null || dados.nome().isBlank()) {
            throw new NegocioException("O nome do aluno e' obrigatorio.");
        }
        if (dados.email() == null || dados.email().isBlank()) {
            throw new NegocioException("O e-mail do aluno e' obrigatorio.");
        }
        if (usuarioRepository.existePorEmail(dados.email())) {
            throw new NegocioException("Ja existe um usuario com este e-mail.");
        }

        UUID responsavelId = null;
        if (ehMenor(dados.dataNascimento())) {
            responsavelId = resolverResponsavel(respInput);
        }

        Aluno novo = new Aluno(null, dados.nome(), dados.email(), null,
                dados.dataNascimento(), dados.cpf(), dados.rg(), dados.telefone(),
                dados.endereco(), dados.observacoes(), responsavelId);
        return (Aluno) usuarioRepository.salvar(novo);
    }

    private UUID resolverResponsavel(DadosResponsavelInput respInput) {
        if (respInput == null || respInput.cpf() == null || respInput.cpf().isBlank()
                || respInput.nome() == null || respInput.nome().isBlank()) {
            throw new NegocioException("Aluno menor de idade exige os dados do responsavel financeiro (RN-18).");
        }
        Responsavel responsavel = responsavelRepository.buscarPorCpf(respInput.cpf())
                .orElseGet(() -> responsavelRepository.salvar(new Responsavel(
                        null, respInput.nome(), respInput.cpf(), respInput.telefone(), respInput.email())));
        return responsavel.getId();
    }

    private boolean ehMenor(LocalDate dataNascimento) {
        return dataNascimento != null && Period.between(dataNascimento, LocalDate.now()).getYears() < 18;
    }
}
