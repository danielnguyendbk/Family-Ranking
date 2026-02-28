package com.familyranking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "games")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Builder.Default
    private int winPoint = 3;

    @Builder.Default
    private int drawPoint = 1;

    @Builder.Default
    private int lossPoint = 0;

    @Column(name = "is_team_game")
    @Builder.Default
    private boolean teamGame = false;
}
