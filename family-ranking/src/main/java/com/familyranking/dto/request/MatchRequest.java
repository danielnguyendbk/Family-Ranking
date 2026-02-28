package com.familyranking.dto.request;

import com.familyranking.entity.Match.BetType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MatchRequest {

    @NotNull
    private Long gameId;

    private boolean teamMatch;

    // 1v1
    private Long opponentId;

    // Team match
    private Long team1Id;
    private Long team2Id;

    @NotNull
    private BetType betType;

    private String betDescription;

    private Integer score1;
    private Integer score2;

    // Optional: directly set winner (player/team id)
    private Long winnerId;
}
