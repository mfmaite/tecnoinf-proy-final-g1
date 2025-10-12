package com.mentora.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.request.EmailRequest;
import com.mentora.backend.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/email")
public class EmailController {
  private final EmailService emailService;

  public EmailController(EmailService emailService) {
    this.emailService = emailService;
  }

  @PostMapping("/send")
  public ResponseEntity<ResponseDTO<EmailRequest>> sendEmail(@Valid @RequestBody EmailRequest request) {
    try {
      emailService.sendEmail(request.getRecipient(), request.getSubject(), request.getBody());

      return ResponseEntity.ok(new ResponseDTO<>(
              true,
              HttpStatus.OK.value(),
              "Email enviado correctamente",
              request)
      );
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new ResponseDTO<>(
              false,
              HttpStatus.BAD_REQUEST.value(),
              e.getMessage(),
              null)
      );
    }
  }
}
