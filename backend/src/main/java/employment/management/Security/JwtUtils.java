package employment.management.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;


import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days by default
    private int refreshTokenDurationMs;

    private final UserDetailsServiceImpl userDetailsService;

    private Key key;

    public JwtUtils(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("roles", userPrincipal.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .toList())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + refreshTokenDurationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .claim("refresh", true)
                .compact();
    }

    public String generateTokenFromRefreshToken(String refreshToken) {
        String username = getUserNameFromJwtToken(refreshToken);
        
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        // Load user details to get roles
        UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(username);

        System.out.println("Generating new token for user: " + username + " with roles: " + 
            userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList());

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .toList())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        if (key == null) {
            key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            if (key == null) {
                key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            }

            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(authToken)
                .getBody();
                
            // Skip roles validation for refresh tokens
            if (claims.get("refresh", Boolean.class) == null) {
                // Only validate roles for access tokens
                if (!claims.containsKey("roles")) {
                    System.err.println("JWT token is missing roles claim");
                    return false;
                }
            }

            return true;
        } catch (SecurityException e) {
            System.err.println("Invalid JWT signature: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }

        return false;
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            if (key == null) {
                key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            }

            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();

            return claims.get("refresh", Boolean.class) != null && 
                   claims.get("refresh", Boolean.class);
        } catch (Exception e) {
            System.err.println("Error validating refresh token: " + e.getMessage());
            return false;
        }
    }
} 