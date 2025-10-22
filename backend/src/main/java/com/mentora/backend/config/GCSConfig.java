package com.mentora.backend.config;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class GCSConfig {

    @Value("${gcs.bucket.name:}")
    private String bucketName;

    @Value("${gcs.credentials.file:}")
    private String credentialsFile;

    @org.springframework.context.annotation.Lazy
    @Bean
    public Storage getStorage() throws IOException {
        // Try, in order: explicit file path -> classpath resource -> GOOGLE_APPLICATION_CREDENTIALS -> default credentials
        try {
            InputStream credentialsStream = resolveCredentialsStream();
            if (credentialsStream != null) {
                return StorageOptions.newBuilder()
                        .setCredentials(ServiceAccountCredentials.fromStream(credentialsStream))
                        .build()
                        .getService();
            }
        } catch (IOException ignored) {
            // Fall through to default credentials
        }

        return StorageOptions.getDefaultInstance().getService();
    }

    private InputStream resolveCredentialsStream() throws IOException {
        // 1) Explicit path from property (absolute or relative)
        if (credentialsFile != null && !credentialsFile.isBlank()) {
            File file = new File(credentialsFile);
            if (file.exists()) {
                return new FileInputStream(file);
            }
            // 2) Try to load as classpath resource
            String resourcePath = credentialsFile.startsWith("/") ? credentialsFile.substring(1) : credentialsFile;
            InputStream classpathStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourcePath);
            if (classpathStream != null) {
                return classpathStream;
            }
        }

        // 3) GOOGLE_APPLICATION_CREDENTIALS env var
        String adcPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (adcPath != null && !adcPath.isBlank()) {
            File file = new File(adcPath);
            if (file.exists()) {
                return new FileInputStream(file);
            }
        }

        // 4) No stream resolved -> let caller fall back to default
        return null;
    }

    public String getBucketName() {
        return bucketName;
    }
}

