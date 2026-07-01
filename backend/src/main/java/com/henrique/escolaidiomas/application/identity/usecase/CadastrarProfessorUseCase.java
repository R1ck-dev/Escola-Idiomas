package com.henrique.escolaidiomas.application.identity.usecase;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.identity.dto.CadastrarProfessorInput;
import com.henrique.escolaidiomas.application.identity.dto.ProfessorResumoDTO;
import com.henrique.escolaidiomas.domain.identity.model.Professor;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * RN-04: a gestao cadastra um professor. A conta nasce PENDENTE_VERIFICACAO (sem
 * senha) e o 1o acesso e' provisionado por e-mail (RN-39).
 */
@Service
@RequiredArgsConstructor
public class CadastrarProfessorUseCase {

    private final UsuarioRepository usuarioRepository;
    private final ProvisionarPrimeiroAcessoUseCase provisionarPrimeiroAcesso;

    @Transactional
    public ProfessorResumoDTO execute(CadastrarProfessorInput input) {
        if (usuarioRepository.existePorEmail(input.email())) {
            throw new NegocioException("Ja existe um usuario com este e-mail.");
        }

        Professor professor = new Professor(
                null,
                input.nome(),
                input.email(),
                null, // senha definida pelo professor no 1o acesso
                input.cpf(),
                input.rg(),
                input.telefone(),
                input.chavePix(),
                input.dadosBancarios(),
                input.idiomasHabilitados());

        Usuario salvo = usuarioRepository.salvar(professor);
        provisionarPrimeiroAcesso.execute(salvo);

        return new ProfessorResumoDTO(salvo.getId(), salvo.getNome(), salvo.getEmail(), salvo.getStatus());
    }
}
