package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "file_resources")
public class FileResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename; // nombre original del archivo

    @Column(nullable = false)
    private String storagePath; // URL pública en GCS

    @Column(nullable = false)
    private Long size; // tamaño en bytes

    @Column(nullable = false)
    private String contentType; // tipo MIME

    private Instant uploadedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_id")
    private Content content; // contenido temático asociado

    // ====== Getters y Setters ======
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }

    public Content getContent() { return content; }
    public void setContent(Content content) { this.content = content; }
}
