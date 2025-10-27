package employment.management.Service;

import employment.management.DTO.AuthResponse;
import employment.management.DTO.LoginRequest;
import employment.management.DTO.SignupRequest;
import employment.management.Model.ERole;
import employment.management.Model.Employee;
import employment.management.Model.User;
import employment.management.Repository.EmployeeRepository;
import employment.management.Repository.UserRepository;
import employment.management.Security.JwtUtils;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TwoFactorAuthService twoFactorAuthService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Value("${admin.key}")
    private String adminKey;

    private final Map<String, String> emailVerificationCodes = new HashMap<>();
    private final Map<String, PasswordResetToken> passwordResetTokens = new HashMap<>();

    private static class PasswordResetToken {
        private final String email;
        private final long expiryTime;

        public PasswordResetToken(String email) {
            this.email = email;
            // Token expires in 15 minutes
            this.expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    public AuthService(UserRepository userRepository, EmployeeRepository employeeRepository,
                      PasswordEncoder passwordEncoder, EmailService emailService,
                      TwoFactorAuthService twoFactorAuthService,
                      AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.twoFactorAuthService = twoFactorAuthService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Check if there's an existing employee with this email
        Optional<Employee> existingEmployee = employeeRepository.findByEmail(request.getEmail());
        
        System.out.println("Found existing employee: " + (existingEmployee.isPresent() ? "yes" : "no"));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        if (ERole.Admin.equals(request.getRole()) && !adminKey.equalsIgnoreCase(request.getAdminKey())) {
            throw new RuntimeException("Invalid admin key");
        }
        user.setRole(request.getRole() != null ? request.getRole() : ERole.User);

        // Link the user to the existing employee if found
        if (existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            user.setEmployee(employee);
            System.out.println("Linking user to employee with ID: " + employee.getEmpId());
        }

        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        emailVerificationCodes.put(request.getEmail(), verificationCode);

        String twoFactorSecret = twoFactorAuthService.generateNewSecret();
        user.setTwoFactorSecret(twoFactorSecret);
        user.setTwoFactorEnabled(false);

        user = userRepository.save(user);
        System.out.println("Saved user with ID: " + user.getUserId() + ", Employee link status: " + (user.getEmployee() != null));
        
        try {
            emailService.sendVerificationEmail(request.getEmail(), verificationCode);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email");
        }

        AuthResponse response = new AuthResponse();
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setTwoFactorEnabled(false);
        response.setTwoFactorQrCode(twoFactorAuthService.generateQrCodeImageUri(twoFactorSecret, user.getEmail()));
        response.setLinkedToEmployee(existingEmployee.isPresent());
        
        return response;
    }

    public String verifyEmail(String email, String code) {
        String storedCode = emailVerificationCodes.get(email);
        if (storedCode != null && storedCode.equals(code)) {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setEmailVerified(true);
            userRepository.save(user);
            emailVerificationCodes.remove(email);
            return "Email verified successfully";
        }
        throw new RuntimeException("Invalid verification code");
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified");
        }

        if (user.isTwoFactorEnabled()) {
            if (request.getTwoFactorCode() == null) {
                throw new RuntimeException("2FA code required");
            }
            if (!twoFactorAuthService.verifyCode(request.getTwoFactorCode(), user.getTwoFactorSecret())) {
                throw new RuntimeException("Invalid 2FA code");
            }
        }

        String token = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setTwoFactorEnabled(user.isTwoFactorEnabled());
        
        return response;
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        // Get username from refresh token
        String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
        
        // Get user details
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newToken = jwtUtils.generateTokenFromRefreshToken(refreshToken);
        
        AuthResponse response = new AuthResponse();
        response.setToken(newToken);
        response.setRefreshToken(refreshToken);
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setTwoFactorEnabled(user.isTwoFactorEnabled());
        return response;
    }

    public String initiatePasswordReset(String email) {
        userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        passwordResetTokens.put(resetToken, new PasswordResetToken(email));

        try {
            emailService.sendPasswordResetEmail(email, resetToken);
            return "Password reset instructions sent to your email";
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokens.get(token);
        if (resetToken == null || resetToken.isExpired()) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        User user = userRepository.findByEmail(resetToken.email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokens.remove(token);

        return "Password reset successfully";
    }

    public String generateTwoFactorSecret(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = twoFactorAuthService.generateNewSecret();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        return twoFactorAuthService.generateQrCodeImageUri(secret, email);
    }

    public boolean verifyTwoFactorCode(String email, String code) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return twoFactorAuthService.verifyCode(code, user.getTwoFactorSecret());
    }

    public String enableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!twoFactorAuthService.verifyCode(code, user.getTwoFactorSecret())) {
            throw new RuntimeException("Invalid 2FA code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return "Two-factor authentication enabled";
    }

    public String disableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!twoFactorAuthService.verifyCode(code, user.getTwoFactorSecret())) {
            throw new RuntimeException("Invalid 2FA code");
        }

        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        return "Two-factor authentication disabled";
    }
} 