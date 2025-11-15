package com.mentora.backend.repository;

import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByCi(String ci);
    Optional<User> findByEmail(String email);
    boolean existsByCi(String ci);
    boolean existsByEmail(String email);
}


