package com.henrique.escolaidiomas.domain.academico.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.henrique.escolaidiomas.domain.academico.enums.TipoAvaliacao;
import com.henrique.escolaidiomas.domain.academico.model.Avaliacao;

public interface AvaliacaoRepository {
    Avaliacao salvar(Avaliacao avaliacao);
    Optional<Avaliacao> buscarPorMatriculaSemestreTipo(UUID matriculaId, UUID semestreId, TipoAvaliacao tipo);
    List<Avaliacao> listarPorMatriculaESemestre(UUID matriculaId, UUID semestreId);
}
