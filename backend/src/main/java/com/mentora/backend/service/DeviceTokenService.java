package com.mentora.backend.service;

import com.mentora.backend.model.DeviceToken;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.DeviceTokenRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    public DeviceTokenService(DeviceTokenRepository deviceTokenRepository, UserRepository userRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
    }

    public void upsertToken(String userCi, String token) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        DeviceToken existing = deviceTokenRepository.findByToken(token).orElse(null);
        if (existing != null) {
            existing.setUser(user);
            deviceTokenRepository.save(existing);
            return;
        }

        DeviceToken dt = new DeviceToken(user, token);
        deviceTokenRepository.save(dt);
    }

    public List<DeviceToken> getTokensForUser(String userCi) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return deviceTokenRepository.findAllByUser(user);
    }

    public void removeToken(String token) {
        deviceTokenRepository.deleteByToken(token);
    }
}


