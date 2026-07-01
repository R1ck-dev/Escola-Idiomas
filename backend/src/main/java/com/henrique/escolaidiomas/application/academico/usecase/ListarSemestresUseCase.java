package com.henrique.escolaidiomas.application.academico.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.academico.dto.SemestreDTO;
import com.henrique.escolaidiomas.domain.academico.port.SemestreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ListarSemestresUseCase {

    private final SemestreRepository semestreRepository;

    public List<SemestreDTO> execute() {
        return semestreRepository.listar().stream().map(SemestreDTO::de).toList();
    }
}
