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
import com.henrique.escolaidiomas.domain.identity.model.Aluno;
import com.henrique.escolaidiomas.domain.identity.model.Responsavel;
import com.henrique.escolaidiomas.domain.identity.model.Usuario;
import com.henrique.escolaidiomas.domain.identity.port.ResponsavelRepository;
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
    private final ResponsavelRepository responsavelRepository;
    private final TurmaRepository turmaRepository;

    public PaginaDTO<MensalidadePainelDTO> execute(String competencia, StatusMensalidade situacao, Pageable pageable) {
        LocalDate hoje = LocalDate.now();

        Map<UUID, Matricula> matriculas = new HashMap<>();
        Map<UUID, Usuario> alunos = new HashMap<>();
        Map<UUID, String> telefones = new HashMap<>();
        Map<UUID, String> turmaNomes = new HashMap<>();

        Page<Mensalidade> pagina = mensalidadeRepository.buscarPainel(competencia, situacao, hoje, pageable);
        List<MensalidadePainelDTO> conteudo = pagina.getContent().stream()
                .map(m -> {
                    Matricula matricula = matriculas.computeIfAbsent(m.getMatriculaId(),
                            id -> matriculaRepository.buscarPorId(id).orElse(null));

                    String alunoNome = null;
                    String telefone = null;
                    String turmaNome = null;
                    if (matricula != null) {
                        Usuario aluno = alunos.computeIfAbsent(matricula.getAlunoId(),
                                id -> usuarioRepository.buscarPorId(id).orElse(null));
                        alunoNome = (aluno != null) ? aluno.getNome() : null;
                        telefone = telefones.computeIfAbsent(matricula.getAlunoId(), id -> resolverTelefone(aluno));
                        turmaNome = turmaNomes.computeIfAbsent(matricula.getTurmaId(),
                                id -> turmaRepository.buscarPorId(id).map(t -> t.getNome()).orElse(null));
                    }
                    return MensalidadePainelDTO.de(m, alunoNome, turmaNome, telefone, hoje);
                })
                .toList();

        return PaginaDTO.de(conteudo, pagina);
    }

    /**
     * Telefone do destinatario da cobranca (RN-41): responsavel financeiro se o aluno for menor
     * e tiver telefone; senao o proprio aluno. {@code null} se nao houver telefone cadastrado.
     */
    private String resolverTelefone(Usuario aluno) {
        if (!(aluno instanceof Aluno a)) {
            return null;
        }
        if (a.getResponsavelId() != null) {
            Responsavel r = responsavelRepository.buscarPorId(a.getResponsavelId()).orElse(null);
            if (r != null && temTexto(r.getTelefone())) {
                return r.getTelefone();
            }
        }
        return temTexto(a.getTelefone()) ? a.getTelefone() : null;
    }

    private boolean temTexto(String s) {
        return s != null && !s.isBlank();
    }
}
