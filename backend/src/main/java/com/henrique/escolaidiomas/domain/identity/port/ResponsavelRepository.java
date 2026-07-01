package com.henrique.escolaidiomas.domain.identity.port;

import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.identity.model.Responsavel;

public interface ResponsavelRepository {
    Responsavel salvar(Responsavel responsavel);
    Optional<Responsavel> buscarPorId(UUID id);
    Optional<Responsavel> buscarPorCpf(String cpf);
}
