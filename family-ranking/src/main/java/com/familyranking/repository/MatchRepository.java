package com.familyranking.repository;

import com.familyranking.entity.Match;
import com.familyranking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    void deleteByGame_Id(Long gameId);

    @Modifying
    @Query("DELETE FROM Match m WHERE m.player1.id = :userId OR m.player2.id = :userId OR m.createdBy.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT m FROM Match m
        WHERE m.player1 = :user OR m.player2 = :user
           OR m.createdBy = :user
        ORDER BY m.createdAt DESC
    """)
    List<Match> findByUser(@Param("user") User user);

    @Query("""
        SELECT m FROM Match m
        WHERE m.game.id = :gameId
          AND (m.player1 = :user OR m.player2 = :user OR m.createdBy = :user)
        ORDER BY m.createdAt DESC
    """)
    List<Match> findByUserAndGame(@Param("user") User user, @Param("gameId") Long gameId);
}
