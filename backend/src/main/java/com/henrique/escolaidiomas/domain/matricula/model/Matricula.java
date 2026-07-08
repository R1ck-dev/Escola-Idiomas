package com.henrique.escolaidiomas.domain.matricula.model;

import java.time.LocalDate;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

/**
 * Matricula: junção Aluno↔Turma (RN-08) que carrega o ciclo de vida (RN-27).
 * As transicoes validam o status atual para nao pular etapas.
 */
public class Matricula {

    private UUID id;
    private UUID alunoId;
    private UUID turmaId;
    private LocalDate dataMatricula;
    private StatusMatricula status;
    private String motivoRejeicao;

    /** Construtor de criacao: nasce aguardando aprovacao (RN-02). */
    public Matricula(UUID id, UUID alunoId, UUID turmaId, LocalDate dataMatricula) {
        this.id = (id != null) ? id : UUID.randomUUID();
        this.alunoId = alunoId;
        this.turmaId = turmaId;
        this.dataMatricula = (dataMatricula != null) ? dataMatricula : LocalDate.now();
        this.status = StatusMatricula.AGUARDANDO_APROVACAO;
    }

    /** Construtor de reconstituicao. */
    public Matricula(UUID id, UUID alunoId, UUID turmaId, LocalDate dataMatricula, StatusMatricula status,
            String motivoRejeicao) {
        this.id = id;
        this.alunoId = alunoId;
        this.turmaId = turmaId;
        this.dataMatricula = dataMatricula;
        this.status = status;
        this.motivoRejeicao = motivoRejeicao;
    }

    public void aprovar() {
        // Aprova tanto uma solicitacao nova quanto um candidato da lista de espera (RN-20).
        exigirStatusEntre("aprovar", StatusMatricula.AGUARDANDO_APROVACAO, StatusMatricula.LISTA_ESPERA);
        this.status = StatusMatricula.ATIVA;
        this.motivoRejeicao = null;
    }

    public void rejeitar(String motivo) {
        // Rejeita uma solicitacao ou remove um candidato da lista de espera (RN-20).
        exigirStatusEntre("rejeitar", StatusMatricula.AGUARDANDO_APROVACAO, StatusMatricula.LISTA_ESPERA);
        if (motivo == null || motivo.isBlank()) {
            throw new NegocioException("Informe o motivo da rejeicao.");
        }
        this.status = StatusMatricula.REJEITADA;
        this.motivoRejeicao = motivo;
    }

    /** RN-20: coloca a solicitacao na lista de espera (turma sem vaga no momento). */
    public void moverParaListaEspera() {
        exigirStatus(StatusMatricula.AGUARDANDO_APROVACAO, "mover para a lista de espera");
        this.status = StatusMatricula.LISTA_ESPERA;
    }

    public void trancar() {
        exigirStatus(StatusMatricula.ATIVA, "trancar");
        this.status = StatusMatricula.TRANCADA;
    }

    public void encerrar() {
        if (this.status != StatusMatricula.ATIVA && this.status != StatusMatricula.TRANCADA) {
            throw new NegocioException("So e' possivel encerrar uma matricula ativa ou trancada.");
        }
        this.status = StatusMatricula.ENCERRADA;
    }

    private void exigirStatus(StatusMatricula esperado, String acao) {
        if (this.status != esperado) {
            throw new NegocioException(
                    "Nao e' possivel " + acao + " uma matricula com status " + this.status + ".");
        }
    }

    private void exigirStatusEntre(String acao, StatusMatricula... esperados) {
        for (StatusMatricula e : esperados) {
            if (this.status == e) {
                return;
            }
        }
        throw new NegocioException(
                "Nao e' possivel " + acao + " uma matricula com status " + this.status + ".");
    }

    public UUID getId() {
        return id;
    }

    public UUID getAlunoId() {
        return alunoId;
    }

    public UUID getTurmaId() {
        return turmaId;
    }

    public LocalDate getDataMatricula() {
        return dataMatricula;
    }

    public StatusMatricula getStatus() {
        return status;
    }

    public String getMotivoRejeicao() {
        return motivoRejeicao;
    }
}
