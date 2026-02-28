package com.familyranking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminCreateUserRequest {
    @NotBlank private String username;
    @NotBlank private String email;
    @NotBlank private String password;
}
