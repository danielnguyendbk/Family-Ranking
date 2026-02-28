package com.familyranking.service.impl;

import com.familyranking.dto.request.GameRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.Game;
import com.familyranking.exception.BadRequestException;
import com.familyranking.exception.ResourceNotFoundException;
import com.familyranking.repository.GameRepository;
import com.familyranking.repository.MatchRepository;
import com.familyranking.repository.PlayerGameStatsRepository;
import com.familyranking.repository.TeamRepository;
import com.familyranking.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PlayerGameStatsRepository statsRepository;

    @Override
    public List<Response.GameDto> getAllGames() {
        return gameRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Override
    public Response.GameDto createGame(GameRequest request) {
        if (gameRepository.existsByName(request.getName())) {
            throw new BadRequestException("Game with name '" + request.getName() + "' already exists");
        }
        Game game = Game.builder()
                .name(request.getName())
                .description(request.getDescription())
                .winPoint(request.getWinPoint())
                .drawPoint(request.getDrawPoint())
                .lossPoint(request.getLossPoint())
                .teamGame(request.isTeamGame())
                .build();
        return mapToDto(gameRepository.save(game));
    }

    @Override
    public Response.GameDto updateGame(Long id, GameRequest request) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        if (gameRepository.findByName(request.getName()).filter(g -> !g.getId().equals(id)).isPresent()) {
            throw new BadRequestException("Game with name '" + request.getName() + "' already exists");
        }
        game.setName(request.getName());
        game.setDescription(request.getDescription());
        game.setWinPoint(request.getWinPoint());
        game.setDrawPoint(request.getDrawPoint());
        game.setLossPoint(request.getLossPoint());
        game.setTeamGame(request.isTeamGame());
        return mapToDto(gameRepository.save(game));
    }

    @Override
    @Transactional
    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new ResourceNotFoundException("Game not found");
        }
        // Remove dependent data (matches reference game and teams; teams reference game; stats reference game)
        matchRepository.deleteByGame_Id(id);
        teamRepository.deleteAll(teamRepository.findByGame_Id(id));
        statsRepository.deleteByGame_Id(id);
        gameRepository.deleteById(id);
    }

    public Response.GameDto mapToDto(Game game) {
        return Response.GameDto.builder()
                .id(game.getId())
                .name(game.getName())
                .description(game.getDescription())
                .winPoint(game.getWinPoint())
                .drawPoint(game.getDrawPoint())
                .lossPoint(game.getLossPoint())
                .teamGame(game.isTeamGame())
                .build();
    }
}
