package com.familyranking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_game_stats",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","game_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlayerGameStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Builder.Default private int points = 0;
    @Builder.Default private int wins   = 0;
    @Builder.Default private int losses = 0;
    @Builder.Default private int draws  = 0;
}
