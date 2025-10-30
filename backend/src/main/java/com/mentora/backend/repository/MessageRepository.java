package com.mentora.backend.repository;

import com.mentora.backend.model.Chat;
import com.mentora.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findAllByChatOrderByDateSentAsc(Chat chat);
}
