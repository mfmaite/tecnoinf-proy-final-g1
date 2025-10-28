package com.mentora.backend.dt;

public class DtFileResource {
    private String filename;
    private String storagePath;
    private Long size;
    private String gcsFileName;

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public String getGcsFileName() { return gcsFileName; }
    public void setGcsFileName(String gcsFileName) { this.gcsFileName = gcsFileName; }

}
