package com.henrique.escolaidiomas.application.financeiro.usecase;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.henrique.escolaidiomas.application.financeiro.dto.MensalidadePainelDTO;
import com.henrique.escolaidiomas.application.shared.dto.PaginaDTO;
import com.henrique.escolaidiomas.domain.financeiro.enums.StatusMensalidade;
import com.henrique.escolaidiomas.domain.financeiro.model.Mensalidade;
import com.henrique.escolaidiomas.domain.financeiro.port.MensalidadeRepository;
import com.henrique.escolaidiomas.domain.identity.port.UsuarioRepository;
import com.henrique.escolaidiomas.domain.matricula.model.Matricula;
import com.henrique.escolaidiomas.domain.matricula.port.MatriculaRepository;
import com.henrique.escolaidiomas.domain.turma.port.TurmaRepository;

import lombok.RequiredArgsConstructor;

/**
 * RN-12: painel financeiro do mes, paginado. Lista as mensalidades da competencia com a
 * situacao (pago/aberto/atrasado) e o valor atualizado (multa/mora) calculados hoje, ja
 * cruzados com os nomes de aluno e turma para exibir na tabela. O filtro opcional de
 * {@code situacao} vai na consulta (paginacao correta, inclusive para ATRASADA/ABERTA, que
 * sao derivadas do vencimento). Os cruzamentos (matricula/aluno/turma) sao memoizados
 * dentro da pagina para nao rebuscar os mesmos registros.
 */
@Service
@RequiredArgsConstructor
public class ConsultarPainelFinanceiroUseCase {

    private final MensalidadeRepository mensalidadeRepository;
    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TurmaRepository turmaRepository;

    public PaginaDTO<MensalidadePainelDTO> execute(String competencia, StatusMensalidade situacao, Pageable pageable) {
        LocalDate hoje = LocalDate.now();

        Map<UUID, Matricula> matriculas = new HashMap<>();
        Map<UUID, String> alunoNomes = new HashMap<>();
        Map<UUID, String> turmaNomes = new HashMap<>();

        Page<Mensalidade> pagina = mensalidadeRepository.buscarPainel(competencia, situacao, hoje, pageable);
        List<MensalidadePainelDTO> conteudo = pagina.getContent().stream()
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

        return PaginaDTO.de(conteudo, pagina);
    }
}
