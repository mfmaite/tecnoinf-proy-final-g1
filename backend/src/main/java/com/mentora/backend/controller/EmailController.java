package com.mentora.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentora.backend.requests.EmailRequest;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/email")
public class EmailController {
  private final EmailService emailService;

  public EmailController(EmailService emailService) {
    this.emailService = emailService;
  }

  @PostMapping("/send")
  @Operation(summary = "Enviar un email",
             description = "Envía un email a un destinatario con un asunto y un cuerpo")
  @ApiResponse(responseCode = "200", description = "Email enviado exitosamente")
  @ApiResponse(responseCode = "400", description = "Datos inválidos")
  public ResponseEntity<DtApiResponse<EmailRequest>> sendEmail(@Valid @RequestBody EmailRequest request) {
    try {
      emailService.sendEmail(request.getRecipient(), request.getSubject(), request.getBody());

      return ResponseEntity.ok(new DtApiResponse<>(
              true,
              HttpStatus.OK.value(),
              "Email enviado correctamente",
              request)
      );
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new DtApiResponse<>(
              false,
              HttpStatus.BAD_REQUEST.value(),
              e.getMessage(),
              null)
      );
    }
  }
}
