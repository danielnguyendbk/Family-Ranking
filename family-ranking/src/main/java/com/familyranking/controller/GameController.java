package com.familyranking.controller;

import com.familyranking.dto.request.GameRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;
import com.familyranking.exception.ForbiddenException;
import com.familyranking.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<List<Response.GameDto>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @PostMapping
    public ResponseEntity<Response.GameDto> createGame(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GameRequest request) {
        requireAdmin(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.createGame(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response.GameDto> updateGame(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody GameRequest request) {
        requireAdmin(user);
        return ResponseEntity.ok(gameService.updateGame(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        requireAdmin(user);
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    private static void requireAdmin(User user) {
        if (user == null || !"admin".equalsIgnoreCase(user.getUsername())) {
            throw new ForbiddenException("Only the admin user can manage games");
        }
    }
}
