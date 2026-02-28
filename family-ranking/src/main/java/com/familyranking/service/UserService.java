package com.familyranking.service;

import com.familyranking.dto.request.AdminCreateUserRequest;
import com.familyranking.dto.request.AdminUpdateUserRequest;
import com.familyranking.dto.request.ProfileUpdateRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;

import java.util.List;

public interface UserService {
    Response.UserProfile getProfile(User user);
    Response.UserProfile updateProfile(User user, ProfileUpdateRequest request);
    Response.UserProfile mapToProfile(User user);
    List<Response.UserProfile> getAllUsers();

    Response.UserProfile createUserByAdmin(AdminCreateUserRequest request);
    Response.UserProfile updateUserByAdmin(Long userId, AdminUpdateUserRequest request);
    void deleteUserByAdmin(Long userId);
}
