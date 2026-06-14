package issue_tracker.services;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    public final String SECRET_KEY = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0987654321";
    public final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Generate JWT with email and role inside
    public Object generateJWT(Object email, Object role) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", email);
        payload.put("role", role);

        return Jwts.builder()
                .claims(payload)
                .issuedAt(new Date())
                .expiration(new Date(new Date().getTime() + 86400000)) // 24 hours
                .signWith(key)
                .compact();
    }

    // Validate JWT and return payload (email + role)
    public Map<String, Object> validateJWT(String token) throws Exception {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Date expiration = claims.getExpiration();
        if (expiration == null || expiration.before(new Date()))
            throw new Exception("Token expired!");

        Map<String, Object> payload = new HashMap<>();
        payload.put("username", claims.get("username"));
        payload.put("role", claims.get("role"));
        return payload;
    }
}