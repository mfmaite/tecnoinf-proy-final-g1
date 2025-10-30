package com.mentora.backend.dt;

import com.mentora.backend.model.User;

public class DtChat {

    private Long id;
    private String participant1Ci;
    private String participant2Ci;

    public DtChat() {}

    public DtChat(Long id, User participant1, User participant2) {
        this.id = id;
        this.participant1Ci = participant1 != null ? participant1.getCi() : null;
        this.participant2Ci = participant2 != null ? participant2.getCi() : null;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getParticipant1Ci() { return participant1Ci; }
    public void setParticipant1Ci(String participant1Ci) { this.participant1Ci = participant1Ci; }

    public String getParticipant2Ci() { return participant2Ci; }
    public void setParticipant2Ci(String participant2Ci) { this.participant2Ci = participant2Ci; }
}
