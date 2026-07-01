package com.henrique.escolaidiomas.domain.financeiro.port;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.financeiro.model.Despesa;

public interface DespesaRepository {
    Despesa salvar(Despesa despesa);

    /** Despesas com data no intervalo [inicio, fim] — usado para o extrato do mes (RN-12). */
    List<Despesa> listarPorPeriodo(LocalDate inicio, LocalDate fim);

    List<Despesa> listarPorProfessor(UUID professorId);
}
