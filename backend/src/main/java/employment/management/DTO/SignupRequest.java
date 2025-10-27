package employment.management.DTO;

import employment.management.Model.ERole;
import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String password;
    private ERole role;
    private String adminKey;
} 