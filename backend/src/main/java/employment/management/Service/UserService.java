package employment.management.Service;

import employment.management.DTO.UserSignupRequest;
import employment.management.Model.ERole;
import employment.management.Model.Employee;
import employment.management.Model.User;
import employment.management.Repository.EmployeeRepository;
import employment.management.Repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String signup(UserSignupRequest signupRequest, UUID employeeId) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return "Email already exists";
        }

        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }

        // Validate secret key if role is Admin
        if (signupRequest.getRole() == ERole.Admin) {
            if (signupRequest.getSecretKey() == null || !signupRequest.getSecretKey().equals("cedrick12345")) {
                return "Invalid or missing secret key for Admin role";
            }
        } else if (signupRequest.getSecretKey() != null) {
            return "Secret key is only required for Admin role";
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setEmployee(employee.get());
        user.setRole(signupRequest.getRole() != null ? signupRequest.getRole() : ERole.User);
        userRepository.save(user);
        return "User registered successfully";
    }

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return null;
        }

        if (passwordEncoder.matches(password, user.get().getPassword())) {
            return user.get();
        }
        return null;
    }

    public boolean verifyAdmin(User user) {
        return user != null && user.getRole() == ERole.Admin;
    }

    public String resetPassword(String email, String newPassword) {
        try {
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isEmpty()) {
                return "User not found";
            }

            User existingUser = user.get();
            existingUser.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(existingUser);
            emailService.sendPasswordResetEmail(email, newPassword);
            return "Password reset successfully";
        } catch (MessagingException e) {
            // Log the error and return a user-friendly message
            System.err.println("Failed to send password reset email: " + e.getMessage());
            return "Password updated but failed to send confirmation email";
        }
    }

    public String generateTwoFactorSecret(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return "User not found";
        }

        String secret = UUID.randomUUID().toString();
        User existingUser = user.get();
        existingUser.setTwoFactorSecret(secret);
        userRepository.save(existingUser);
        return secret;
    }

    public boolean verifyTwoFactorCode(UUID userId, String code) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return false;
        }

        return user.get().getTwoFactorSecret().equals(code);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Map<String, Object> getUserProfile(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return null;
        }

        User currentUser = user.get();
        Employee employee = currentUser.getEmployee();
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("email", currentUser.getEmail());
        
        if (employee != null) {
            profile.put("firstName", employee.getFirstName());
            profile.put("lastName", employee.getLastName());
            profile.put("phone", employee.getPhone());
            profile.put("dateOfBirth", employee.getDateOfBirth());
            profile.put("gender", employee.getGender());
            
            if (employee.getDepartment() != null) {
                profile.put("department", employee.getDepartment());
            }
            
            if (employee.getPosition() != null) {
                profile.put("position", employee.getPosition());
            }
        }
        
        return profile;
    }
}