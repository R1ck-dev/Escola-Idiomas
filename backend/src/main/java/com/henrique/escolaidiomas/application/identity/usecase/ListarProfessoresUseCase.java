package com.henrique.escolaidiomas.application.identity.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.ProfessorDTO;
import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Professor;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;

import lombok.RequiredArgsConstructor;

/** Lista os professores cadastrados (gestao): tela de professores e seletores de turma/repasse. */
@Service
@RequiredArgsConstructor
public class ListarProfessoresUseCase {

    private final UsuarioRepository usuarioRepository;

    public List<ProfessorDTO> execute() {
        return usuarioRepository.listarPorRole(Role.PROFESSOR).stream()
                .filter(Professor.class::isInstance)
                .map(Professor.class::cast)
                .map(ProfessorDTO::de)
                .toList();
    }
}
