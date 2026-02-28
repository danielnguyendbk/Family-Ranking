package com.familyranking.repository;

import com.familyranking.entity.Game;
import com.familyranking.entity.PlayerGameStats;
import com.familyranking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerGameStatsRepository extends JpaRepository<PlayerGameStats, Long> {
    Optional<PlayerGameStats> findByUserAndGame(User user, Game game);
    List<PlayerGameStats> findByGameOrderByPointsDesc(Game game);
    void deleteByGame_Id(Long gameId);
    void deleteByUser_Id(Long userId);
}
