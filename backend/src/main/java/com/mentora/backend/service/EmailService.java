package com.mentora.backend.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.Properties;
import java.util.Objects;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
  private final String username;
  private final String password;
  private final Properties mailProperties;
  private final String provider;
  private final String resendApiKey;
  private final String fromAddress;

  public EmailService(
      @org.springframework.beans.factory.annotation.Value("${spring.mail.username}") String username,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.password}") String password,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.host}") String host,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.port}") String port,
      @org.springframework.beans.factory.annotation.Value("${email.provider:SMTP}") String provider,
      @org.springframework.beans.factory.annotation.Value("${resend.api.key:}") String resendApiKey,
      @org.springframework.beans.factory.annotation.Value("${email.from:${spring.mail.username}}") String fromAddress) {
    this.username = username;
    this.password = password;
    this.provider = provider;
    this.resendApiKey = resendApiKey;
    this.fromAddress = fromAddress;

    this.mailProperties = new Properties();
    this.mailProperties.put("mail.smtp.host", host);
    this.mailProperties.put("mail.smtp.port", port);
    this.mailProperties.put("mail.smtp.auth", "true");
    this.mailProperties.put("mail.smtp.starttls.enable", "true");
  }

  public void sendEmail(String recipient, String subject, String body) {
    if ("RESEND".equalsIgnoreCase(provider)) {
      sendViaResend(recipient, subject, body);
      return;
    }
    sendViaSmtp(recipient, subject, body);
  }

  @Async("taskExecutor")
  public void sendEmailAsync(String recipient, String subject, String body) {
    sendEmail(recipient, subject, body);
  }

  private void sendViaSmtp(String recipient, String subject, String body) {
    Session session = Session.getDefaultInstance(mailProperties);
    MimeMessage message = new MimeMessage(session);

    try {
        message.setFrom(new InternetAddress(username));
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
        message.setSubject(subject);
        message.setText(body);
        Transport transport = session.getTransport("smtp");
        transport.connect(username, password);
        transport.sendMessage(message, message.getAllRecipients());
        transport.close();
    }
    catch (MessagingException me) {
        me.printStackTrace();
    }
  }

  private void sendViaResend(String recipient, String subject, String body) {
    try {
      if (resendApiKey == null || resendApiKey.isBlank()) {
        throw new IllegalStateException("RESEND api key no configurada (resend.api.key)");
      }
      String sender = Objects.requireNonNullElse(fromAddress, username);
      String json = "{\"from\":\"" + escapeJson(sender) + "\"," +
                    "\"to\":[\"" + escapeJson(recipient) + "\"]," +
                    "\"subject\":\"" + escapeJson(subject) + "\"," +
                    "\"text\":\"" + escapeJson(body) + "\"}";

      HttpRequest request = HttpRequest.newBuilder()
              .uri(URI.create("https://api.resend.com/emails"))
              .header("Authorization", "Bearer " + resendApiKey)
              .header("Content-Type", "application/json; charset=utf-8")
              .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
              .build();

      HttpClient client = HttpClient.newHttpClient();
      HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new RuntimeException("Resend error HTTP " + response.statusCode() + ": " + response.body());
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static String escapeJson(String s) {
    if (s == null) return "";
    StringBuilder sb = new StringBuilder(s.length() + 16);
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      switch (c) {
        case '"' -> sb.append("\\\"");
        case '\\' -> sb.append("\\\\");
        case '\b' -> sb.append("\\b");
        case '\f' -> sb.append("\\f");
        case '\n' -> sb.append("\\n");
        case '\r' -> sb.append("\\r");
        case '\t' -> sb.append("\\t");
        default -> {
          if (c < 0x20) {
            sb.append(String.format("\\u%04x", (int)c));
          } else {
            sb.append(c);
          }
        }
      }
    }
    return sb.toString();
  }

    public void sendWelcomeEmail(String recipient, String plainPassword) {
        String subject = "Bienvenido a Mentora";
        String body = "Su cuenta ha sido creada.\n" +
                "Usuario: " + recipient + "\n" +
                "Contraseña: " + plainPassword + "\n" +
                "Se recomienda cambiarla al ingresar.";

        sendEmail(recipient, subject, body);
    }
}
