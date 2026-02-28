package com.familyranking.config;

import com.familyranking.entity.Game;
import com.familyranking.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final GameRepository gameRepository;

    @Override
    public void run(String... args) {
        if (gameRepository.count() == 0) {
            List<Game> games = List.of(
                Game.builder()
                    .name("Cờ Tướng")
                    .description("Cờ tướng truyền thống – mỗi ván thắng được 3 điểm")
                    .winPoint(3).drawPoint(1).lossPoint(0).teamGame(false)
                    .build(),
                Game.builder()
                    .name("Bi-a")
                    .description("Billiard carom 3 băng hoặc pool")
                    .winPoint(3).drawPoint(0).lossPoint(0).teamGame(false)
                    .build(),
                Game.builder()
                    .name("Bóng Bàn")
                    .description("Table tennis – cá nhân hoặc đôi")
                    .winPoint(3).drawPoint(1).lossPoint(0).teamGame(true)
                    .build(),
                Game.builder()
                    .name("Cờ Vua")
                    .description("International chess")
                    .winPoint(3).drawPoint(1).lossPoint(0).teamGame(false)
                    .build()
            );
            gameRepository.saveAll(games);
            log.info("✅ Seeded {} games", games.size());
        }
    }
}
