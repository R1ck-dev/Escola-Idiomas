package com.henrique.escolaidiomas.application.shared.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Pagina ESTAVEL para as respostas de listagem. Nao serializamos o {@link Page}/PageImpl
 * do Spring direto (contrato instavel entre versoes + warning do Jackson por serializar
 * o PageImpl); expomos apenas os campos necessarios para a UI paginar.
 */
public record PaginaDTO<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    /** Converte um {@link Page} do Spring cujo conteudo ja esta no tipo final. */
    public static <T> PaginaDTO<T> de(Page<T> pagina) {
        return new PaginaDTO<>(
                pagina.getContent(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }

    /**
     * Converte preservando os metadados de paginacao da {@code origem}, mas usando um
     * {@code content} ja transformado (ex.: enriquecido com nomes de aluno/turma). Evita
     * carregar tudo em memoria: so o conteudo da pagina consultada e' enriquecido.
     */
    public static <T> PaginaDTO<T> de(List<T> content, Page<?> origem) {
        return new PaginaDTO<>(
                content,
                origem.getNumber(),
                origem.getSize(),
                origem.getTotalElements(),
                origem.getTotalPages());
    }
}
