package employment.management.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private String email;
    private String role;
    private boolean twoFactorEnabled;
    private String twoFactorQrCode;
    private boolean linkedToEmployee;
} 