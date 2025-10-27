package com.mentora.backend.security;

import com.mentora.backend.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey; // Debe tener al menos 32 chars

    @Value("${jwt.expiration}") // tiempo en ms
    private long jwtExpirationMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // Genera token con expiración y rol
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getCi())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .addClaims(Map.of("role", user.getRole())) // agregar roles si quieres
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extrae el ci
    public String extractCi(String token) {
        return getClaims(token).getSubject();
    }

    // Extrae rol
    public String extractRole(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    // Valida token (firma + expiración)
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado: " + e.getMessage());
        } catch (JwtException e) {
            System.out.println("Token inválido: " + e.getMessage());
        }
        return false;
    }

    private Claims getClaims(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
