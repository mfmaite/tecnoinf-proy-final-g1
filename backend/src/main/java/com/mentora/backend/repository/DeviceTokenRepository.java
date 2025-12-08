package com.mentora.backend.repository;

import com.mentora.backend.model.DeviceToken;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, String> {
    List<DeviceToken> findAllByUser(User user);
    Optional<DeviceToken> findByToken(String token);
    void deleteByToken(String token);
}


