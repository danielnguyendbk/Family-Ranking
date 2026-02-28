package com.familyranking.controller;

import com.familyranking.dto.request.TeamRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Response.TeamDto> createTeam(@Valid @RequestBody TeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request));
    }

    @GetMapping
    public ResponseEntity<List<Response.TeamDto>> getTeams(@RequestParam Long gameId) {
        return ResponseEntity.ok(teamService.getTeamsByGame(gameId));
    }
}
