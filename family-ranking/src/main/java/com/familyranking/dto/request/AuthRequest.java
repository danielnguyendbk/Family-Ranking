package com.familyranking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank private String username;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data
    public static class Login {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    public static class ForgotPassword {
        @NotBlank @Email private String email;
    }

    @Data
    public static class ResetPassword {
        @NotBlank private String token;
        @NotBlank @Size(min = 6) private String newPassword;
    }
}
