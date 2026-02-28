package com.familyranking.dto.response;

import com.familyranking.entity.Match.BetType;
import com.familyranking.entity.Match.MatchStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class Response {

    @Data @Builder
    public static class AuthToken {
        private String token;
        private String username;
        private String email;
    }

    @Data @Builder
    public static class UserProfile {
        private Long id;
        private String username;
        private String email;
        private String avatar;
        private int totalPoints;
        private int wins;
        private int losses;
        private int draws;
        private LocalDateTime createdAt;
        /** Plain-text password – only populated for admin requests, null otherwise. */
        private String rawPassword;
    }

    @Data @Builder
    public static class GameDto {
        private Long id;
        private String name;
        private String description;
        private int winPoint;
        private int drawPoint;
        private int lossPoint;
        private boolean teamGame;
    }

    @Data @Builder
    public static class TeamDto {
        private Long id;
        private String name;
        private Long gameId;
        private List<UserProfile> members;
    }

    @Data @Builder
    public static class MatchDto {
        private Long id;
        private GameDto game;
        private boolean teamMatch;
        private UserProfile player1;
        private UserProfile player2;
        private TeamDto team1;
        private TeamDto team2;
        private BetType betType;
        private String betDescription;
        private Integer score1;
        private Integer score2;
        private Long winnerId;
        private MatchStatus status;
        private boolean resultConfirmedByOpponent;
        private boolean betSettledRequested;
        private LocalDateTime betSettledRequestedAt;
        private boolean betSettledConfirmed;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class RankingEntry {
        private int rank;
        private Long userId;
        private String username;
        private String avatar;
        private int points;
        private int wins;
        private int losses;
        private int draws;
    }

    @Data @Builder
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public static ApiResponse ok(String message) {
            return ApiResponse.builder().success(true).message(message).build();
        }

        public static ApiResponse ok(String message, Object data) {
            return ApiResponse.builder().success(true).message(message).data(data).build();
        }
    }
}
