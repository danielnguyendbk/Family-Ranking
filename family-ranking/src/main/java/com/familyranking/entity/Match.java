package com.familyranking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Match {

    public enum BetType { FRIENDLY, LY_NUOC, OTHER }
    public enum MatchStatus { PENDING, ACCEPTED, REJECTED, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "is_team_match")
    @Builder.Default
    private boolean teamMatch = false;

    // 1v1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player1_id")
    private User player1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player2_id")
    private User player2;

    // Team match
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team1_id")
    private Team team1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team2_id")
    private Team team2;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BetType betType = BetType.FRIENDLY;

    private String betDescription;

    private Integer score1;
    private Integer score2;

    // Winner: user id or team id depending on isTeamMatch
    private Long winnerId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchStatus status = MatchStatus.PENDING;

    @Builder.Default
    private boolean resultConfirmedByOpponent = false;

    @Builder.Default
    private boolean betSettledRequested = false;

    private LocalDateTime betSettledRequestedAt;

    @Builder.Default
    private boolean betSettledConfirmed = false;

    @Builder.Default
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Creator of the match
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
