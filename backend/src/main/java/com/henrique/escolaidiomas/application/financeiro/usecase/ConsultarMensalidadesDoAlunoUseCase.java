package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-22: mensalidades do aluno autenticado (todas as suas matriculas), com situacao e
 * valor atualizado calculados hoje. O cliente filtra a competencia do mes se quiser.
 */
@Service
@RequiredArgsConstructor
public class ConsultarMensalidadesDoAlunoUseCase {

    private final MatriculaRepository matriculaRepository;
    private final MensalidadeRepository mensalidadeRepository;

    public List<MensalidadeDTO> execute(UUID alunoId) {
        LocalDate hoje = LocalDate.now();
        return matriculaRepository.listarPorAluno(alunoId).stream()
                .map(Matricula::getId)
                .flatMap(matriculaId -> mensalidadeRepository.listarPorMatricula(matriculaId).stream())
                .map(m -> MensalidadeDTO.de(m, hoje))
                .toList();
    }
}
