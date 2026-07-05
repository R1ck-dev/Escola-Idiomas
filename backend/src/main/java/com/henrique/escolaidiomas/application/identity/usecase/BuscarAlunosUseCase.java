package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.AlunoBuscaDTO;
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;

import lombok.RequiredArgsConstructor;

/**
 * Busca alunos por nome ou e-mail (case-insensitive) para o header/seletor da gestao.
 * Termo vazio/ausente retorna os primeiros alunos por nome. Limitado a {@link #LIMITE}.
 */
@Service
@RequiredArgsConstructor
public class BuscarAlunosUseCase {

    private static final int LIMITE = 20;

    private final UsuarioRepository usuarioRepository;

    public List<AlunoBuscaDTO> execute(String q) {
        String termo = (q == null || q.isBlank()) ? null : q.trim();
        return usuarioRepository.buscarAlunosPorTermo(termo, LIMITE).stream()
                .filter(Aluno.class::isInstance)
                .map(Aluno.class::cast)
                .map(AlunoBuscaDTO::de)
                .toList();
    }
}
