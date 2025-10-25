package com.mentora.backend.controller;

import com.mentora.backend.config.GCSConfig;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/gcs")
public class GCSController {

    @Autowired
    private GCSConfig gcsConfig;

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) throws IOException {

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return "El archivo no tiene un nombre válido";
        }

        Storage storage = gcsConfig.getStorage();
        String bucketName = gcsConfig.getBucketName();
        BlobId blobId = BlobId.of(bucketName, originalFilename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();

        storage.create(blobInfo, file.getBytes());

        return "Archivo subido correctamente: " + originalFilename;
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        try {
            Storage storage = gcsConfig.getStorage();
            String bucketName = gcsConfig.getBucketName();

            Blob blob = storage.get(BlobId.of(bucketName, filename));
            if (blob == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(blob.getContentType()))
                    .body(blob.getContent());

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}




