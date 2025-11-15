package com.mentora.backend.dt;

import com.mentora.backend.model.Notification;

public class DtNotification {

    private String id;
    private String message;
    private String link;
    private Boolean isRead;

    DtNotification() {}

    public DtNotification(String id, String message, String link, Boolean isRead) {
        this.id = id;
        this.message = message;
        this.link = link;
        this.isRead = isRead;
    }

    public DtNotification(Notification n) {
        this.id = n.getId();
        this.message = n.getMessage();
        this.link = n.getLink();
        this.isRead = n.getRead();
    }

    public String getId() { return id; }
    public String getMessage() { return message; }
    public String getLink() { return link; }
    public Boolean getIsRead() { return isRead; }
}
