package com.familyranking.service.impl;

import com.familyranking.dto.request.AuthRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;
import com.familyranking.exception.BadRequestException;
import com.familyranking.exception.ResourceNotFoundException;
import com.familyranking.repository.UserRepository;
import com.familyranking.security.JwtService;
import com.familyranking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public Response.AuthToken register(AuthRequest.Register request) {
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

        userRepository.save(user);
        String token = jwtService.generateToken(user);

        return Response.AuthToken.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    public Response.AuthToken login(AuthRequest.Login request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user);

        return Response.AuthToken.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

}
