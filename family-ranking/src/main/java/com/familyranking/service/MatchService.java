package com.familyranking.service;

import com.familyranking.dto.request.MatchRequest;
import com.familyranking.dto.response.Response;
import com.familyranking.entity.User;

import java.util.List;

public interface MatchService {
    Response.MatchDto createMatch(User creator, MatchRequest request);
    Response.MatchDto acceptMatch(User user, Long matchId);
    Response.MatchDto rejectMatch(User user, Long matchId);
    Response.MatchDto requestSettlement(User user, Long matchId);
    Response.MatchDto confirmSettlement(User user, Long matchId);
    List<Response.MatchDto> getMyMatches(User user);
    List<Response.RankingEntry> getRanking(Long gameId);
}
