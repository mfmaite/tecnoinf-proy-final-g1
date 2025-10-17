package com.mentora.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.util.Properties;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;

@Service
public class EmailService {

    private final String username;
    private final String password;
    private final Properties mailProperties;

    public EmailService(
            @Value("${spring.mail.username}") String username,
            @Value("${spring.mail.password}") String password,
            @Value("${spring.mail.host}") String host,
            @Value("${spring.mail.port}") String port) {

        this.username = username;
        this.password = password;

        this.mailProperties = new Properties();
        this.mailProperties.put("mail.smtp.host", host);
        this.mailProperties.put("mail.smtp.port", port);
        this.mailProperties.put("mail.smtp.auth", "true");
        this.mailProperties.put("mail.smtp.starttls.enable", "true");
    }

    public void sendEmail(String recipient, String subject, String body) {
        Session session = Session.getInstance(mailProperties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
            message.setSubject(subject, "UTF-8");
            message.setContent(body, "text/html; charset=utf-8");
            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Error enviando correo: " + e.getMessage(), e);
        }
    }
}
