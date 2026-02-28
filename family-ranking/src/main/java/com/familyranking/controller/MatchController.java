package com.familyranking.controller;

import com.familyranking.dto.request.MatchRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;
import com.familyranking.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/create")
    public ResponseEntity<Response.MatchDto> createMatch(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.createMatch(user, request));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Response.MatchDto> acceptMatch(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(matchService.acceptMatch(user, id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Response.MatchDto> rejectMatch(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(matchService.rejectMatch(user, id));
    }

    @PostMapping("/{id}/settle-request")
    public ResponseEntity<Response.MatchDto> requestSettlement(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(matchService.requestSettlement(user, id));
    }

    @PostMapping("/{id}/settle-confirm")
    public ResponseEntity<Response.MatchDto> confirmSettlement(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(matchService.confirmSettlement(user, id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Response.MatchDto>> getMyMatches(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.getMyMatches(user));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Response.RankingEntry>> getRanking(@RequestParam Long gameId) {
        return ResponseEntity.ok(matchService.getRanking(gameId));
    }
}
