package com.mentora.backend.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.mentora.backend.model.DeviceToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private final DeviceTokenService deviceTokenService;
    private final boolean enabled;

    public PushNotificationService(
            DeviceTokenService deviceTokenService,
            @Value("${firebase.credentials:}") String firebaseCredentialsPath
    ) {
        this.deviceTokenService = deviceTokenService;
        this.enabled = initializeFirebase(firebaseCredentialsPath);
    }

    private boolean initializeFirebase(String credentialsPath) {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return true;
            }

            InputStream credentialsStream = null;
            if (credentialsPath != null && !credentialsPath.isBlank()) {
                File f = new File(credentialsPath);
                if (f.exists()) {
                    credentialsStream = new FileInputStream(f);
                }
            }

            if (credentialsStream == null) {
                String env = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                if (env != null && !env.isBlank()) {
                    File f = new File(env);
                    if (f.exists()) {
                        credentialsStream = new FileInputStream(f);
                    }
                }
            }

            if (credentialsStream == null) {
                // No credentials available; keep service disabled
                return false;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                    .build();
            FirebaseApp.initializeApp(options);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void sendToUser(String userCi, String title, String body, Map<String, String> data) {
        if (!enabled) {
            return;
        }
        List<DeviceToken> tokens = deviceTokenService.getTokensForUser(userCi);
        if (tokens == null || tokens.isEmpty()) {
            return;
        }

        List<Message> messages = new ArrayList<>();
        List<String> tokenStrings = new ArrayList<>();
        for (DeviceToken dt : tokens) {
            Message.Builder mb = Message.builder()
                    .setToken(dt.getToken())
                    .setNotification(Notification.builder().setTitle(title).setBody(body).build());
            if (data != null && !data.isEmpty()) {
                mb.putAllData(data);
            }
            messages.add(mb.build());
            tokenStrings.add(dt.getToken());
        }

        try {
            BatchResponse response = FirebaseMessaging.getInstance().sendEach(messages);
            if (response.getFailureCount() > 0) {
                for (int i = 0; i < response.getResponses().size(); i++) {
                    var r = response.getResponses().get(i);
                    if (!r.isSuccessful() && r.getException() != null) {
                        var ex = r.getException();
                        if (ex.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                            deviceTokenService.removeToken(tokenStrings.get(i));
                        }
                    }
                }
            }
        } catch (Exception ignore) {
            // Intentionally swallow; we don't want to fail the application flow because of push errors
        }
    }

    public void sendToUser(String userCi, String title, String body, String link) {
        Map<String, String> data = new HashMap<>();
        if (link != null) data.put("link", link);
        sendToUser(userCi, title, body, data);
    }
}


