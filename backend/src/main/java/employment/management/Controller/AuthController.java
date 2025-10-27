package employment.management.Controller;

import employment.management.DTO.AuthResponse;
import employment.management.DTO.LoginRequest;
import employment.management.DTO.SignupRequest;
import employment.management.DTO.TokenRefreshRequest;
import employment.management.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String code) {
        return ResponseEntity.ok(authService.verifyEmail(email, code));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(authService.initiatePasswordReset(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(authService.resetPassword(token, newPassword));
    }

    @PostMapping("/2fa/generate")
    public ResponseEntity<?> generateTwoFactorSecret(@RequestParam String email) {
        return ResponseEntity.ok(authService.generateTwoFactorSecret(email));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verifyTwoFactorCode(
            @RequestParam String email,
            @RequestParam String code) {
        return ResponseEntity.ok(authService.verifyTwoFactorCode(email, code));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enableTwoFactor(
            @RequestParam String email,
            @RequestParam String code) {
        return ResponseEntity.ok(authService.enableTwoFactor(email, code));
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disableTwoFactor(
            @RequestParam String email,
            @RequestParam String code) {
        return ResponseEntity.ok(authService.disableTwoFactor(email, code));
    }
} 