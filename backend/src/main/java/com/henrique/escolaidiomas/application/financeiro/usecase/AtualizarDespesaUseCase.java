package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.DespesaDTO;
import com.henrique.escolaidiomas.application.financeiro.dto.RegistrarDespesaInput;
import com.henrique.escolaidiomas.domain.financeiro.enums.CategoriaDespesa;
import com.henrique.escolaidiomas.domain.financeiro.model.Despesa;
import com.henrique.escolaidiomas.domain.financeiro.port.DespesaRepository;
import com.henrique.escolaidiomas.domain.identity.enums.Role;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.shared.NegocioException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/** US-16: a gestao edita uma saida do caixa (mesmas regras do registro — RN-12/13). */
@Service
@RequiredArgsConstructor
public class AtualizarDespesaUseCase {

    private final DespesaRepository despesaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public DespesaDTO execute(UUID id, RegistrarDespesaInput input) {
        Despesa despesa = despesaRepository.buscarPorId(id)
                .orElseThrow(() -> new NegocioException("Despesa nao encontrada."));
        if (input.categoria() == CategoriaDespesa.REPASSE_PROFESSOR) {
            validarProfessor(input.professorId());
        }
        despesa.atualizar(input.descricao(), input.categoria(), input.valor(), input.data(),
                input.categoria() == CategoriaDespesa.REPASSE_PROFESSOR ? input.professorId() : null);
        return DespesaDTO.de(despesaRepository.salvar(despesa));
    }

    private void validarProfessor(UUID professorId) {
        if (professorId == null) {
            throw new NegocioException("Repasse a professor exige o professor de destino.");
        }
        Usuario usuario = usuarioRepository.buscarPorId(professorId)
                .orElseThrow(() -> new NegocioException("Professor nao encontrado."));
        if (usuario.getRole() != Role.PROFESSOR) {
            throw new NegocioException("O usuario informado nao e' um professor.");
        }
    }
}
