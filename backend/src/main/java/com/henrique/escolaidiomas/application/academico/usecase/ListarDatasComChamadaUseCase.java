package com.henrique.escolaidiomas.application.academico.usecase;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.domain.academico.model.Aula;
import com.henrique.escolaidiomas.domain.academico.port.AulaRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;
import com.henrique.escolaidiomas.domain.turma.model.Turma;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Datas em que a turma ja teve chamada aberta (qualquer semestre), por data. Alimenta a
 * navegacao ◀/▶ da chamada, para o professor voltar a um dia ja dado e corrigir presencas.
 */
@Service
@RequiredArgsConstructor
public class ListarDatasComChamadaUseCase {

    private final TurmaRepository turmaRepository;
    private final AulaRepository aulaRepository;

    public List<LocalDate> execute(UUID professorId, UUID turmaId) {
        Turma turma = turmaRepository.buscarPorId(turmaId)
                .orElseThrow(() -> new NegocioException("Turma nao encontrada."));
        if (!turma.getProfessorId().equals(professorId)) {
            throw new NegocioException("Esta turma nao pertence a este professor.");
        }
        return aulaRepository.listarPorTurma(turmaId).stream()
                .map(Aula::getData)
                .toList();
    }
}
