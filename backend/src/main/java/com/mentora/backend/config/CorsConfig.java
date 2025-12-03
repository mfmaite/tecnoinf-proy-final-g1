package com.mentora.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

	@Value("${cors.allowed-origins:http://localhost:3000}")
	private String allowedOriginsProperty;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

		// Orígenes permitidos (configurable por propiedad/env var, soporta múltiples separados por coma)
		if (allowedOriginsProperty != null) {
			for (String origin : allowedOriginsProperty.split(",")) {
				String trimmed = origin.trim();
				if (!trimmed.isEmpty()) {
					// Si se necesita wildcard (e.g. https://*.example.com) usar addAllowedOriginPattern
					if (trimmed.contains("*")) {
						config.addAllowedOriginPattern(trimmed);
					} else {
						config.addAllowedOrigin(trimmed);
					}
				}
			}
		}

        // Permitir credenciales
        config.setAllowCredentials(true);

        // Permitir métodos HTTP comunes
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("PATCH");

        // Permitir headers comunes
        config.addAllowedHeader("*"); // Permitir todos los headers
        config.addExposedHeader("Authorization"); // Exponer el header de autorización

        // Aplicar la configuración a todas las rutas
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
