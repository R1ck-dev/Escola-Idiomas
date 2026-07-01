package com.henrique.escolaidiomas.application.financeiro.service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.EmailSenderPort;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * RN-41: resolve o destinatario da cobranca de uma mensalidade (responsavel financeiro
 * do aluno menor; senao o proprio aluno) e dispara o e-mail correspondente. Reusado pela
 * geracao mensal e pelo job de inadimplencia. Se nao houver e-mail, apenas ignora.
 */
@Service
@RequiredArgsConstructor
public class NotificarCobrancaService {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final EmailSenderPort emailSenderPort;

    /** Nome do aluno associado a mensalidade (para o alerta a gestao — RN-29). */
    public String nomeDoAluno(UUID matriculaId) {
        return resolverAluno(matriculaId).map(Usuario::getNome).orElse("Aluno");
    }

    public void notificarNovaMensalidade(Mensalidade mensalidade) {
        resolverDestinatario(mensalidade.getMatriculaId()).ifPresent(d ->
                emailSenderPort.enviarAvisoCobranca(d.email(), d.nome(), mensalidade.getCompetencia(),
                        mensalidade.getValorEfetivo(), mensalidade.getVencimento()));
    }

    public void notificarAtraso(Mensalidade mensalidade, LocalDate hoje) {
        resolverDestinatario(mensalidade.getMatriculaId()).ifPresent(d ->
                emailSenderPort.enviarAvisoAtraso(d.email(), d.nome(), mensalidade.getCompetencia(),
                        mensalidade.valorAtualizadoEm(hoje), mensalidade.diasAtrasoEm(hoje)));
    }

    private Optional<Usuario> resolverAluno(UUID matriculaId) {
        Matricula matricula = matriculaRepository.buscarPorId(matriculaId).orElse(null);
        if (matricula == null) {
            return Optional.empty();
        }
        return usuarioRepository.buscarPorId(matricula.getAlunoId());
    }

    private Optional<Destinatario> resolverDestinatario(UUID matriculaId) {
        Usuario aluno = resolverAluno(matriculaId).orElse(null);
        if (aluno == null) {
            return Optional.empty();
        }
        // Menor com responsavel: cobranca vai para o responsavel financeiro (RN-18/41).
        if (aluno instanceof Aluno a && a.getResponsavelId() != null) {
            Responsavel r = responsavelRepository.buscarPorId(a.getResponsavelId()).orElse(null);
            if (r != null && temTexto(r.getEmail())) {
                return Optional.of(new Destinatario(r.getEmail(), r.getNome()));
            }
        }
        // Senao, o proprio aluno (adulto ou responsavel sem e-mail).
        return temTexto(aluno.getEmail())
                ? Optional.of(new Destinatario(aluno.getEmail(), aluno.getNome()))
                : Optional.empty();
    }

    private boolean temTexto(String s) {
        return s != null && !s.isBlank();
    }

    private record Destinatario(String email, String nome) {
    }
}
