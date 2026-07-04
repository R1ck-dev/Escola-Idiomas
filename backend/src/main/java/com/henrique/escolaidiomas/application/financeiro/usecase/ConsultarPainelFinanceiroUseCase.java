package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadePainelDTO;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * RN-12: painel financeiro do mes. Lista as mensalidades da competencia com a
 * situacao (pago/aberto/atrasado) e o valor atualizado (multa/mora) calculados hoje,
 * ja cruzados com os nomes de aluno e turma para exibir na tabela. Os cruzamentos
 * (matricula/aluno/turma) sao memoizados para nao rebuscar os mesmos registros.
 */
@Service
@RequiredArgsConstructor
public class ConsultarPainelFinanceiroUseCase {

    private final MensalidadeRepository mensalidadeRepository;
    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TurmaRepository turmaRepository;

    public List<MensalidadePainelDTO> execute(String competencia) {
        LocalDate hoje = LocalDate.now();

        Map<UUID, Matricula> matriculas = new HashMap<>();
        Map<UUID, String> alunoNomes = new HashMap<>();
        Map<UUID, String> turmaNomes = new HashMap<>();

        return mensalidadeRepository.listarPorCompetencia(competencia).stream()
                .map(m -> {
                    Matricula matricula = matriculas.computeIfAbsent(m.getMatriculaId(),
                            id -> matriculaRepository.buscarPorId(id).orElse(null));

                    String alunoNome = null;
                    String turmaNome = null;
                    if (matricula != null) {
                        alunoNome = alunoNomes.computeIfAbsent(matricula.getAlunoId(),
                                id -> usuarioRepository.buscarPorId(id).map(u -> u.getNome()).orElse(null));
                        turmaNome = turmaNomes.computeIfAbsent(matricula.getTurmaId(),
                                id -> turmaRepository.buscarPorId(id).map(t -> t.getNome()).orElse(null));
                    }
                    return MensalidadePainelDTO.de(m, alunoNome, turmaNome, hoje);
                })
                .toList();
    }
}
