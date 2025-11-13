package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "participant1Id", referencedColumnName = "ci")
    private User participant1Id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "participant2Id", referencedColumnName = "ci")
    private User participant2Id;

    public Chat() {}

    public Chat(User participant1Id, User participant2Id) {
        this.participant1Id = participant1Id;
        this.participant2Id = participant2Id;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getParticipant1Id() { return participant1Id; }
    public void setParticipant1Id(User participant1Id) { this.participant1Id = participant1Id; }

    public User getParticipant2Id() { return participant2Id; }
    public void setParticipant2Id(User participant2Id) { this.participant2Id = participant2Id; }
}
