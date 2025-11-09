package com.mentora.backend.repository;

import com.mentora.backend.model.Chat;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE " +
            "(c.participant1Id = :u1 AND c.participant2Id = :u2) OR " +
            "(c.participant1Id = :u2 AND c.participant2Id = :u1)")
    Optional<Chat> findByParticipants(@Param("u1") User user1, @Param("u2") User user2);

    @Query("SELECT c FROM Chat c WHERE c.participant1Id = :user OR c.participant2Id = :user")
    List<Chat> findAllByParticipant(@Param("user") User user);
}
