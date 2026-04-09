package com.example.Gig.Worker.Insurance.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private static final SecretKey SECRET_KEY =
            Keys.hmacShaKeyFor("gigshieldsecretgigshieldsecret12345".getBytes());

    private final long ACCESS_EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours
    private final long REFRESH_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7 days

    public String generateAccessToken(String subject){
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION))
                .signWith(SECRET_KEY)
                .compact();
    }

    public String generateRefreshToken(String subject){
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(SECRET_KEY)
                .compact();
    }

    // ✅ Alias — full access token (7 days)
    public String generateToken(String subject){
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(SECRET_KEY)
                .compact();
    }

    // 🔐 Short-lived SCOPED token for OTP verification phase only
    public String generateScopedToken(String subject, String scope, int expiryMinutes){
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(Map.of("scope", scope))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + (long) expiryMinutes * 60 * 1000))
                .signWith(SECRET_KEY)
                .compact();
    }

    // 🔍 Extract custom claim (e.g. "scope")
    public String extractClaim(String token, String claimKey){
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get(claimKey, String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token){
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token){
        try{
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token);
            return true;
        }catch (Exception e){
            return false;
        }
    }
}