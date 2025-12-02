package com.mentora.backend.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.mentora.backend.config.GCSConfig;
import com.google.cloud.storage.Storage.SignUrlOption;
import com.mentora.backend.dt.DtFileResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class FileStorageService {

    private final Storage storage;
    private final GCSConfig gcsConfig;

    public FileStorageService(Storage storage, GCSConfig gcsConfig) {
        this.storage = storage;
        this.gcsConfig = gcsConfig;
    }

    public DtFileResource store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Archivo vacío");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String gcsFileName = UUID.randomUUID() + extension;

        BlobInfo blobInfo = BlobInfo.newBuilder(gcsConfig.getBucketName(), gcsFileName)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return new DtFileResource(
            originalFilename,
            "gs://" + gcsConfig.getBucketName() + "/" + gcsFileName,
            file.getSize()
        );
    }

    public String generateSignedUrl(String gcsPath) {
        int durationMinutes = 60;

        if (gcsPath == null || gcsPath.isBlank()) {
            return null;
        }
        if (!gcsPath.startsWith("gs://")) {
            // Si no es un path de GCS, devolver tal cual (p.ej. http/https)
            return gcsPath;
        }

        String noPrefix = gcsPath.replace("gs://", "");
        int slash = noPrefix.indexOf("/");

        if (slash <= 0) {
            throw new IllegalArgumentException("GCS path inválido");
        }

        String bucket = noPrefix.substring(0, slash);
        String objectPath = noPrefix.substring(slash + 1);

        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectPath).build();

        URL signedUrl = storage.signUrl(
                blobInfo,
                durationMinutes,
                TimeUnit.MINUTES,
                SignUrlOption.withV4Signature()
        );

        return signedUrl.toString();
    }

    public void delete(String gcsPath) {
        if (gcsPath == null || gcsPath.isBlank()) return;
        if (!gcsPath.startsWith("gs://")) return;

        String noPrefix = gcsPath.replace("gs://", "");
        int slash = noPrefix.indexOf("/");
        if (slash <= 0) return;

        String bucket = noPrefix.substring(0, slash);
        String objectPath = noPrefix.substring(slash + 1);

        storage.delete(bucket, objectPath);
    }
}
