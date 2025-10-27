package employment.management.Controller;

import employment.management.DTO.UserSignupRequest;
import employment.management.Model.User;
import employment.management.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> signup(@RequestBody UserSignupRequest signupRequest, @RequestParam UUID employeeId) {
        String result = userService.signup(signupRequest, employeeId);
        if (result.equals("User registered successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/verify-admin", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyAdmin(@RequestParam UUID userId, @RequestBody User user) {
        Optional<User> storedUser = userService.getUserById(userId);
        if (storedUser.isEmpty()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        boolean isAdmin = userService.verifyAdmin(storedUser.get());
        if (isAdmin) {
            return new ResponseEntity<>("Admin verified", HttpStatus.OK);
        }
        return new ResponseEntity<>("Not an admin", HttpStatus.UNAUTHORIZED);
    }

    @PostMapping(value = "/reset-password", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        String result = userService.resetPassword(email, newPassword);
        if (result.equals("Password reset successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/generate-2fa", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateTwoFactorSecret(@RequestParam UUID userId) {
        String result = userService.generateTwoFactorSecret(userId);
        if (result.equals("User not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping(value = "/verify-2fa", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyTwoFactorCode(@RequestParam UUID userId, @RequestParam String code) {
        boolean verified = userService.verifyTwoFactorCode(userId, code);
        if (verified) {
            return new ResponseEntity<>("2FA verified", HttpStatus.OK);
        }
        return new ResponseEntity<>("Invalid 2FA code", HttpStatus.UNAUTHORIZED);
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getUserById(@PathVariable UUID userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/email/{email}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/profile/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getUserProfile(@PathVariable UUID userId) {
        Map<String, Object> profile = userService.getUserProfile(userId);
        if (profile != null) {
            return new ResponseEntity<>(profile, HttpStatus.OK);
        }
        return new ResponseEntity<>("Profile not found", HttpStatus.NOT_FOUND);
    }
}