package com.mentora.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

@Configuration
public class GCSConfig {

    @Value("${gcs.bucket.name:}")
    private String bucketName;

    @Value("${gcs.credentials.file:}")
    private String credentialsFile;

    @org.springframework.context.annotation.Lazy
    @Bean
    public Storage getStorage() throws IOException {
        try {
            InputStream credentialsStream = resolveCredentialsStream();
            if (credentialsStream != null) {
                GoogleCredentials base = GoogleCredentials.fromStream(credentialsStream);
                GoogleCredentials scoped = base.createScoped(
                        Collections.singletonList("https://www.googleapis.com/auth/cloud-platform")
                );
                return StorageOptions.newBuilder().setCredentials(scoped).build().getService();
            }
        } catch (IOException ignored) {
        }

        return StorageOptions.getDefaultInstance().getService();
    }

    private InputStream resolveCredentialsStream() throws IOException {
        if (credentialsFile != null && !credentialsFile.isBlank()) {
            String trimmed = credentialsFile.trim();
            // Inline JSON in env var
            if (trimmed.startsWith("{")) {
                return new ByteArrayInputStream(trimmed.getBytes(StandardCharsets.UTF_8));
            }
            // Base64 JSON in env var
            try {
                byte[] decoded = Base64.getDecoder().decode(trimmed);
                String asString = new String(decoded, StandardCharsets.UTF_8).trim();
                if (asString.startsWith("{")) {
                    return new ByteArrayInputStream(decoded);
                }
            } catch (IllegalArgumentException ignored) {
                // Not base64, continue as path resolution
            }

            File file = new File(credentialsFile);
            if (file.exists()) {
                return new FileInputStream(file);
            }
            String resourcePath = credentialsFile.startsWith("/") ? credentialsFile.substring(1) : credentialsFile;
            InputStream classpathStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourcePath);
            if (classpathStream != null) {
                return classpathStream;
            }
        }

        String adcPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (adcPath != null && !adcPath.isBlank()) {
            File file = new File(adcPath);
            if (file.exists()) {
                return new FileInputStream(file);
            }
        }

        return null;
    }

    public String getBucketName() {
        return bucketName;
    }
}

