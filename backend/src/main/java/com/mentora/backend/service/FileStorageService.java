package com.mentora.backend.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.mentora.backend.config.GCSConfig;
import com.mentora.backend.model.FileResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Storage storage;
    private final GCSConfig gcsConfig;

    public FileStorageService(Storage storage, GCSConfig gcsConfig) {
        this.storage = storage;
        this.gcsConfig = gcsConfig;
    }

    /**
     * Guarda el archivo en Google Cloud Storage y devuelve un FileResource con la URL.
     */
    public FileResource store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Archivo vacío");
        }

        // Generar nombre único en GCS
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String gcsFileName = UUID.randomUUID() + extension;

        // Crear objeto blob en el bucket
        BlobInfo blobInfo = BlobInfo.newBuilder(gcsConfig.getBucketName(), gcsFileName)
                .setContentType(file.getContentType())
                .build();

        Blob blob = storage.create(blobInfo, file.getBytes());

        // Construir FileResource
        FileResource fr = new FileResource();
        fr.setFilename(originalFilename);
        fr.setStoragePath("https://storage.googleapis.com/" + gcsConfig.getBucketName() + "/" + gcsFileName);
        fr.setContentType(file.getContentType());
        fr.setSize(file.getSize());

        return fr;
    }
}
