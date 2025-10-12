package com.mentora.backend.config;

import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class GCSConfig {

    @Value("${GCS_BUCKET_NAME}")
    private String bucketName;

    @Value("${KEY_DEL_GCS}")
    private String credentialsFile;

    @org.springframework.context.annotation.Lazy
    @Bean
    public Storage getStorage() throws IOException {
        return StorageOptions.newBuilder()
                .setCredentials(ServiceAccountCredentials.fromStream(new FileInputStream(credentialsFile)))
                .build()
                .getService();
    }

    public String getBucketName() {
        return bucketName;
    }
}

