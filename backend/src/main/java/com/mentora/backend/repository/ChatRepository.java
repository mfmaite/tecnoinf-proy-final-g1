package com.mentora.backend.repository;

import com.mentora.backend.model.Chat;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE " +
            "(c.participantId1 = :user1 AND c.participantId2 = :user2) OR " +
            "(c.participantId1 = :user2 AND c.participantId2 = :user1)")
    Optional<Chat> findByParticipants(User user1, User user2);
}
