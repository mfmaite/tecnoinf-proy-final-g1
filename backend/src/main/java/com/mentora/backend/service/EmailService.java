package com.mentora.backend.service;

import org.springframework.stereotype.Service;
import java.util.Properties;

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

  public EmailService(
      @org.springframework.beans.factory.annotation.Value("${spring.mail.username}") String username,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.password}") String password,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.host}") String host,
      @org.springframework.beans.factory.annotation.Value("${spring.mail.port}") String port) {
    this.username = username;
    this.password = password;

    this.mailProperties = new Properties();
    this.mailProperties.put("mail.smtp.host", host);
    this.mailProperties.put("mail.smtp.port", port);
    this.mailProperties.put("mail.smtp.auth", "true");
    this.mailProperties.put("mail.smtp.starttls.enable", "true");
  }

  public void sendEmail(String recipient, String subject, String body) {

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

    public void sendWelcomeEmail(String recipient, String plainPassword) {
        String subject = "Bienvenido a Mentora";
        String body = "Su cuenta ha sido creada.\n" +
                "Usuario: " + recipient + "\n" +
                "Contraseña: " + plainPassword + "\n" +
                "Se recomienda cambiarla al ingresar.";

        sendEmail(recipient, subject, body);
    }
}
