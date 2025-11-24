package com.mentora.backend.dt;

public class DtChat {

    private Long id;
    private DtUser participant1;
    private DtUser participant2;

    public DtChat() {}

    public DtChat(Long id, DtUser participant1, DtUser participant2) {
        this.id = id;
        this.participant1 = participant1;
        this.participant2 = participant2;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DtUser getParticipant1() { return participant1; }
    public void setParticipant1(DtUser participant1) { this.participant1 = participant1; }

    public DtUser getParticipant2() { return participant2; }
    public void setParticipant2(DtUser participant2) { this.participant2 = participant2; }
}
