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

        URL signedUrl = storage.signUrl(
                blobInfo,
                7,
                TimeUnit.DAYS,
                SignUrlOption.withV4Signature()
        );

        DtFileResource fr = new DtFileResource();
        fr.setFilename(originalFilename);
        fr.setStoragePath(signedUrl.toString());
        fr.setSize(file.getSize());

        return fr;
    }
}
