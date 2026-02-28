package com.familyranking.service;

import com.familyranking.dto.request.TeamRequest;
import com.familyranking.dto.response.Response;

import java.util.List;

public interface TeamService {
    Response.TeamDto createTeam(TeamRequest request);
    List<Response.TeamDto> getTeamsByGame(Long gameId);
}
