package com.henrique.escolaidiomas.application.matricula.usecase;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDetalhadaDTO;
import com.henrique.escolaidiomas.application.shared.dto.PaginaDTO;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;

import lombok.RequiredArgsConstructor;

/**
 * US-05: a gestao lista as matriculas paginadas, opcionalmente filtrando por status e/ou
 * por um termo de busca ({@code q}) que casa com o nome OU e-mail do aluno. Os filtros vao
 * na consulta ao repositorio (pagina no banco); so o conteudo da pagina e' enriquecido com
 * os nomes de aluno/turma/responsavel, sem carregar tudo em memoria.
 */
@Service
@RequiredArgsConstructor
public class ListarMatriculasUseCase {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaEnricher enricher;

    public PaginaDTO<MatriculaDetalhadaDTO> execute(StatusMatricula status, String q, Pageable pageable) {
        Collection<UUID> alunoIds = null;
        if (q != null && !q.isBlank()) {
            // Contextos desacoplados: resolve os ids dos alunos que casam com o termo no
            // contexto de identidade e restringe a busca de matriculas a eles.
            List<UUID> ids = usuarioRepository.buscarIdsAlunosPorTermo(q.trim());
            if (ids.isEmpty()) {
                return PaginaDTO.de(Page.<MatriculaDetalhadaDTO>empty(pageable));
            }
            alunoIds = ids;
        }

        Page<Matricula> pagina = matriculaRepository.buscar(status, alunoIds, pageable);
        List<MatriculaDetalhadaDTO> conteudo = enricher.enriquecer(pagina.getContent());
        return PaginaDTO.de(conteudo, pagina);
    }
}
