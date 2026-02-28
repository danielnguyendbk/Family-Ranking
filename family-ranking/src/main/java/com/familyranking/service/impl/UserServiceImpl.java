package com.familyranking.service.impl;

import com.familyranking.dto.request.AdminCreateUserRequest;
import com.familyranking.dto.request.AdminUpdateUserRequest;
import com.familyranking.dto.request.ProfileUpdateRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;
import com.familyranking.exception.BadRequestException;
import com.familyranking.exception.ResourceNotFoundException;
import com.familyranking.repository.MatchRepository;
import com.familyranking.repository.PlayerGameStatsRepository;
import com.familyranking.repository.TeamRepository;
import com.familyranking.repository.UserRepository;
import com.familyranking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PlayerGameStatsRepository statsRepository;

    @Override
    public Response.UserProfile getProfile(User user) {
        return mapToProfile(user);
    }

    @Override
    public Response.UserProfile updateProfile(User user, ProfileUpdateRequest request) {
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!request.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }
        userRepository.save(user);
        return mapToProfile(user);
    }

    @Override
    public Response.UserProfile mapToProfile(User user) {
        return Response.UserProfile.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .totalPoints(user.getTotalPoints())
                .wins(user.getWins())
                .losses(user.getLosses())
                .draws(user.getDraws())
                .createdAt(user.getCreatedAt())
                .rawPassword(user.getRawPassword())
                .build();
    }

    @Override
    public List<Response.UserProfile> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfile)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Response.UserProfile createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rawPassword(request.getPassword())
                .build();
        user = userRepository.save(user);
        return mapToProfile(user);
    }

    @Override
    @Transactional
    public Response.UserProfile updateUserByAdmin(Long userId, AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!request.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setRawPassword(request.getNewPassword());
        }
        user = userRepository.save(user);
        return mapToProfile(user);
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        matchRepository.deleteByUserId(userId);
        for (var team : teamRepository.findByMembersContaining(user)) {
            team.getMembers().remove(user);
            teamRepository.save(team);
        }
        statsRepository.deleteByUser_Id(userId);
        userRepository.delete(user);
    }
}
