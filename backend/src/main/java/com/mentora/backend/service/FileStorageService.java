package com.mentora.backend.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.mentora.backend.config.GCSConfig;
import com.google.cloud.storage.Storage.SignUrlOption;
import com.mentora.backend.dt.DtFileResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
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

    public DtFileResource store(Path path) throws IOException {
        if (path == null || !Files.exists(path) || !Files.isRegularFile(path)) {
            throw new IllegalArgumentException("Archivo inválido");
        }
        String originalFilename = path.getFileName().toString();
        String contentType = Files.probeContentType(path);
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }
        try (InputStream is = Files.newInputStream(path)) {
            return store(originalFilename, is, contentType);
        }
    }

    public DtFileResource store(String originalFilename, InputStream inputStream, String contentType) throws IOException {
        if (inputStream == null) {
            throw new IllegalArgumentException("Stream nulo");
        }
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String gcsFileName = UUID.randomUUID() + extension;

        BlobInfo blobInfo = BlobInfo.newBuilder(gcsConfig.getBucketName(), gcsFileName)
                .setContentType(contentType != null && !contentType.isBlank() ? contentType : "application/octet-stream")
                .build();

        byte[] bytes = inputStream.readAllBytes();
        storage.create(blobInfo, bytes);

        return new DtFileResource(
            originalFilename,
            "gs://" + gcsConfig.getBucketName() + "/" + gcsFileName,
            (long) bytes.length
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
