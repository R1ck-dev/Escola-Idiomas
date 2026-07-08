package com.henrique.escolaidiomas.infrastructure.web.matricula.controller;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.matricula.dto.DadosAlunoInput;
import com.henrique.escolaidiomas.application.matricula.dto.DadosResponsavelInput;
import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDTO;
import com.henrique.escolaidiomas.application.matricula.dto.MatriculaDetalhadaDTO;
import com.henrique.escolaidiomas.application.matricula.dto.SolicitarMatriculaInput;
import com.henrique.escolaidiomas.application.shared.dto.PaginaDTO;
import com.henrique.escolaidiomas.application.matricula.usecase.AprovarMatriculaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.BuscarMatriculaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.EncerrarMatriculaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.ListarMatriculasUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.MoverParaListaEsperaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.RejeitarMatriculaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.SolicitarMatriculaUseCase;
import com.henrique.escolaidiomas.application.matricula.usecase.TrancarMatriculaUseCase;
import com.henrique.escolaidiomas.domain.matricula.enums.StatusMatricula;
import com.henrique.escolaidiomas.infrastructure.web.matricula.dto.RejeitarMatriculaRequest;
import com.henrique.escolaidiomas.infrastructure.web.matricula.dto.SolicitarMatriculaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final SolicitarMatriculaUseCase solicitarMatriculaUseCase;
    private final AprovarMatriculaUseCase aprovarMatriculaUseCase;
    private final RejeitarMatriculaUseCase rejeitarMatriculaUseCase;
    private final TrancarMatriculaUseCase trancarMatriculaUseCase;
    private final EncerrarMatriculaUseCase encerrarMatriculaUseCase;
    private final MoverParaListaEsperaUseCase moverParaListaEsperaUseCase;
    private final ListarMatriculasUseCase listarMatriculasUseCase;
    private final BuscarMatriculaUseCase buscarMatriculaUseCase;

    /** PUBLICO (US-04): candidato solicita a matricula via link. */
    @PostMapping
    public ResponseEntity<MatriculaDTO> solicitar(@RequestBody @Valid SolicitarMatriculaRequest request) {
        var a = request.aluno();
        DadosAlunoInput aluno = new DadosAlunoInput(
                a.nome(), a.email(), a.dataNascimento(), a.cpf(), a.rg(), a.telefone(), a.endereco(), a.observacoes());

        DadosResponsavelInput responsavel = null;
        if (request.responsavel() != null) {
            var r = request.responsavel();
            responsavel = new DadosResponsavelInput(r.nome(), r.cpf(), r.telefone(), r.email());
        }

        SolicitarMatriculaInput input = new SolicitarMatriculaInput(request.turmaId(), aluno, responsavel);
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitarMatriculaUseCase.execute(input));
    }

    /**
     * GESTAO (US-05): lista matriculas paginadas (com nomes de aluno/turma), opcionalmente
     * filtrando por status e/ou por um termo {@code q} (nome ou e-mail do aluno).
     */
    @GetMapping
    public ResponseEntity<PaginaDTO<MatriculaDetalhadaDTO>> listar(
            @RequestParam(required = false) StatusMatricula status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(listarMatriculasUseCase.execute(status, q, PageRequest.of(page, size)));
    }

    /** GESTAO: detalhe de uma matricula com nomes resolvidos. */
    @GetMapping("/{id}")
    public ResponseEntity<MatriculaDetalhadaDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(buscarMatriculaUseCase.execute(id));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<MatriculaDTO> aprovar(@PathVariable UUID id) {
        return ResponseEntity.ok(aprovarMatriculaUseCase.execute(id));
    }

    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<MatriculaDTO> rejeitar(@PathVariable UUID id, @RequestBody @Valid RejeitarMatriculaRequest request) {
        return ResponseEntity.ok(rejeitarMatriculaUseCase.execute(id, request.motivo()));
    }

    /** RN-20: coloca a solicitacao na lista de espera (turma sem vaga). */
    @PostMapping("/{id}/lista-espera")
    public ResponseEntity<MatriculaDTO> listaEspera(@PathVariable UUID id) {
        return ResponseEntity.ok(moverParaListaEsperaUseCase.execute(id));
    }

    @PostMapping("/{id}/trancar")
    public ResponseEntity<MatriculaDTO> trancar(@PathVariable UUID id) {
        return ResponseEntity.ok(trancarMatriculaUseCase.execute(id));
    }

    @PostMapping("/{id}/encerrar")
    public ResponseEntity<MatriculaDTO> encerrar(@PathVariable UUID id) {
        return ResponseEntity.ok(encerrarMatriculaUseCase.execute(id));
    }
}
