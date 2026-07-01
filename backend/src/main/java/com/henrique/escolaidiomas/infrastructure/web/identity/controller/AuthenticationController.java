package com.henrique.escolaidiomas.infrastructure.web.identity.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.escolaidiomas.application.identity.dto.DefinirSenhaViaTokenInput;
import com.henrique.escolaidiomas.application.identity.dto.LoginInput;
import com.henrique.escolaidiomas.application.identity.usecase.AutenticarUsuarioUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.DefinirSenhaViaTokenUseCase;
import com.henrique.escolaidiomas.application.identity.usecase.SolicitarRecuperacaoSenhaUseCase;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.DefinirSenhaRequest;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.LoginRequest;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.RecuperarSenhaRequest;
import com.henrique.escolaidiomas.infrastructure.web.identity.dto.TokenResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AutenticarUsuarioUseCase autenticarUsuarioUseCase;
    private final SolicitarRecuperacaoSenhaUseCase solicitarRecuperacaoSenhaUseCase;
    private final DefinirSenhaViaTokenUseCase definirSenhaViaTokenUseCase;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginInput input = new LoginInput(request.email(), request.password());
        String tokenJwt = autenticarUsuarioUseCase.execute(input);
        return ResponseEntity.ok(new TokenResponse(tokenJwt));
    }

    /** RN-40: solicita recuperacao de senha. Responde sempre 200 (nao revela se o e-mail existe). */
    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(@RequestBody @Valid RecuperarSenhaRequest request) {
        solicitarRecuperacaoSenhaUseCase.execute(request.email());
        return ResponseEntity.ok(Map.of("mensagem",
                "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha."));
    }

    /** RN-39/RN-40: define a senha a partir do token recebido por e-mail (1o acesso ou recuperacao). */
    @PostMapping("/definir-senha")
    public ResponseEntity<Map<String, String>> definirSenha(@RequestBody @Valid DefinirSenhaRequest request) {
        definirSenhaViaTokenUseCase.execute(new DefinirSenhaViaTokenInput(request.token(), request.novaSenha()));
        return ResponseEntity.ok(Map.of("mensagem", "Senha definida com sucesso. Voce ja pode fazer login."));
    }
}
