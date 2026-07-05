package com.henrique.escolaidiomas.application.identity.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.henrique.escolaidiomas.application.academico.dto.BoletimDTO;
import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadeDTO;
import com.henrique.escolaidiomas.application.turma.dto.TurmaDoAlunoDTO;

/**
 * Detalhe completo de um aluno para a gestao (clique na busca do header): dados
 * cadastrais, responsavel (quando menor) e as visoes de turmas, mensalidades e
 * boletim — reaproveitando as consultas ja usadas na area do proprio aluno.
 */
public record AlunoDetalheDTO(
        UUID id,
        String nome,
        String email,
        String cpf,
        String rg,
        String telefone,
        LocalDate dataNascimento,
        String endereco,
        String observacoes,
        boolean menor,
        String responsavelNome,
        String responsavelCpf,
        String responsavelTelefone,
        String responsavelEmail,
        List<TurmaDoAlunoDTO> turmas,
        List<MensalidadeDTO> mensalidades,
        List<BoletimDTO> boletins
) {
}
