package com.mentora.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilitar CSRF para APIs REST
                .csrf(csrf -> csrf.disable())

                // Configuración de autorización
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/users").permitAll() // endpoints públicos
                        .anyRequest().authenticated()           // resto requiere autenticación
                )

                // Configuración de autenticación básica (opcional si usas JWT)
                .httpBasic();

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
