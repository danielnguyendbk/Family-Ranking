package com.familyranking.service;

import com.familyranking.dto.request.GameRequest;
import com.familyranking.dto.response.Response;

import java.util.List;

public interface GameService {
    List<Response.GameDto> getAllGames();
    Response.GameDto createGame(GameRequest request);
    Response.GameDto updateGame(Long id, GameRequest request);
    void deleteGame(Long id);
}
