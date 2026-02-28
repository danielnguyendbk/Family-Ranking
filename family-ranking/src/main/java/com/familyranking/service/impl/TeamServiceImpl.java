package com.familyranking.service.impl;

import com.familyranking.dto.request.TeamRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.Game;
import com.familyranking.entity.Team;
import com.familyranking.entity.User;
import com.familyranking.exception.ResourceNotFoundException;
import com.familyranking.repository.GameRepository;
import com.familyranking.repository.TeamRepository;
import com.familyranking.repository.UserRepository;
import com.familyranking.service.TeamService;
import com.familyranking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public Response.TeamDto createTeam(TeamRequest request) {
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        Set<User> members = new HashSet<>();
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                members.add(userRepository.findById(memberId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + memberId)));
            }
        }

        Team team = Team.builder()
                .name(request.getName())
                .game(game)
                .members(members)
                .build();

        return mapToDto(teamRepository.save(team));
    }

    @Override
    public List<Response.TeamDto> getTeamsByGame(Long gameId) {
        return teamRepository.findByGame_Id(gameId).stream().map(this::mapToDto).toList();
    }

    public Response.TeamDto mapToDto(Team team) {
        return Response.TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .gameId(team.getGame().getId())
                .members(team.getMembers().stream().map(userService::mapToProfile).toList())
                .build();
    }
}
