package com.familyranking.controller;

import com.familyranking.dto.request.AdminCreateUserRequest;
import com.familyranking.dto.request.AdminUpdateUserRequest;
import com.familyranking.dto.request.ProfileUpdateRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;
import com.familyranking.exception.ForbiddenException;
import com.familyranking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private static void requireAdmin(User user) {
        if (user == null || !"admin".equalsIgnoreCase(user.getUsername())) {
            throw new ForbiddenException("Only admin can perform this action");
        }
    }

    @GetMapping
    public ResponseEntity<List<Response.UserProfile>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<Response.UserProfile> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Response.UserProfile> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PostMapping
    public ResponseEntity<Response.UserProfile> createUser(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AdminCreateUserRequest request) {
        requireAdmin(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUserByAdmin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response.UserProfile> updateUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody AdminUpdateUserRequest request) {
        requireAdmin(user);
        return ResponseEntity.ok(userService.updateUserByAdmin(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        requireAdmin(user);
        userService.deleteUserByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
