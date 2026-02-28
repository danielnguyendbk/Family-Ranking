package com.familyranking.repository;

import com.familyranking.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {
    boolean existsByName(String name);
    Optional<Game> findByName(String name);
}
