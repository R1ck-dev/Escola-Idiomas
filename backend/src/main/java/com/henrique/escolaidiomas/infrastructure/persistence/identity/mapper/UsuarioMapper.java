package com.henrique.escolaidiomas.infrastructure.persistence.identity.mapper;

import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Gestao;
import com.henrique.escolaidiomas.domain.identity.model.Professor;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.AlunoJpaEntity;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.GestaoJpaEntity;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.ProfessorJpaEntity;
import com.henrique.escolaidiomas.infrastructure.persistence.identity.entity.UsuarioJpaEntity;

/**
 * Conversao manual dominio <-> entidade JPA. No sentido JPA->dominio usamos
 * Hibernate.unproxy() para resolver o subtipo real por tras do proxy lazy.
 *
 * A cada novo subtipo (Aluno/Professor), acrescente um ramo aqui.
 */
@Component
public class UsuarioMapper {

    // Dominio -> JPA
    public UsuarioJpaEntity toEntity(Usuario usuario) {
        if (usuario instanceof Gestao gestao) {
            GestaoJpaEntity entity = new GestaoJpaEntity();
            preencherDadosBase(entity, gestao);
            return entity;
        }

        if (usuario instanceof Professor professor) {
            ProfessorJpaEntity entity = new ProfessorJpaEntity();
            preencherDadosBase(entity, professor);
            entity.setCpf(professor.getCpf());
            entity.setRg(professor.getRg());
            entity.setTelefone(professor.getTelefone());
            entity.setChavePix(professor.getChavePix());
            entity.setDadosBancarios(professor.getDadosBancarios());
            entity.setIdiomasHabilitados(professor.getIdiomasHabilitados());
            return entity;
        }

        if (usuario instanceof Aluno aluno) {
            AlunoJpaEntity entity = new AlunoJpaEntity();
            preencherDadosBase(entity, aluno);
            entity.setDataNascimento(aluno.getDataNascimento());
            entity.setCpf(aluno.getCpf());
            entity.setRg(aluno.getRg());
            entity.setTelefone(aluno.getTelefone());
            entity.setEndereco(aluno.getEndereco());
            entity.setObservacoes(aluno.getObservacoes());
            entity.setResponsavelId(aluno.getResponsavelId());
            return entity;
        }

        throw new IllegalArgumentException(
                "Tipo de usuario nao suportado pelo Mapper: " + usuario.getClass().getSimpleName());
    }

    // JPA -> Dominio
    public Usuario toDomain(UsuarioJpaEntity entity) {
        UsuarioJpaEntity real = (UsuarioJpaEntity) Hibernate.unproxy(entity);

        if (real instanceof GestaoJpaEntity gestao) {
            return new Gestao(
                    gestao.getId(),
                    gestao.getNome(),
                    gestao.getEmail(),
                    gestao.getSenhaHash(),
                    gestao.getStatus(),
                    gestao.getRole(),
                    gestao.getCriadoEm());
        }

        if (real instanceof ProfessorJpaEntity professor) {
            return new Professor(
                    professor.getId(),
                    professor.getNome(),
                    professor.getEmail(),
                    professor.getSenhaHash(),
                    professor.getStatus(),
                    professor.getRole(),
                    professor.getCriadoEm(),
                    professor.getCpf(),
                    professor.getRg(),
                    professor.getTelefone(),
                    professor.getChavePix(),
                    professor.getDadosBancarios(),
                    professor.getIdiomasHabilitados());
        }

        if (real instanceof AlunoJpaEntity aluno) {
            return new Aluno(
                    aluno.getId(),
                    aluno.getNome(),
                    aluno.getEmail(),
                    aluno.getSenhaHash(),
                    aluno.getStatus(),
                    aluno.getRole(),
                    aluno.getCriadoEm(),
                    aluno.getDataNascimento(),
                    aluno.getCpf(),
                    aluno.getRg(),
                    aluno.getTelefone(),
                    aluno.getEndereco(),
                    aluno.getObservacoes(),
                    aluno.getResponsavelId());
        }

        throw new IllegalArgumentException(
                "Tipo de entidade JPA nao suportado pelo Mapper: " + real.getClass().getSimpleName());
    }

    private void preencherDadosBase(UsuarioJpaEntity entity, Usuario domain) {
        entity.setId(domain.getId());
        entity.setNome(domain.getNome());
        entity.setEmail(domain.getEmail());
        entity.setSenhaHash(domain.getSenhaHash());
        entity.setStatus(domain.getStatus());
        entity.setRole(domain.getRole());
        entity.setCriadoEm(domain.getCriadoEm());
    }
}
