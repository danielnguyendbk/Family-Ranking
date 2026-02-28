package com.familyranking.dto.request;

import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    private String username;
    private String email;
    private String newPassword;
}
