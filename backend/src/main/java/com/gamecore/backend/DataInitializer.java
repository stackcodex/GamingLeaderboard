package com.gamecore.backend;

import com.gamecore.backend.entity.Game;
import com.gamecore.backend.repository.GameRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeGames(GameRepository gameRepository) {

        return args -> {

            if (gameRepository.count() > 0) {
                return;
            }

            gameRepository.save(
                    new Game(
                            "Snake Rush",
                            "Arcade",
                            true,
                            "Classic snake game where players collect food and achieve the highest score."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Memory Match",
                            "Puzzle",
                            true,
                            "Match identical cards and complete the challenge with the best possible score."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Brick Breaker",
                            "Arcade",
                            true,
                            "Break as many bricks as possible using the paddle and ball."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Aim Challenge",
                            "Action",
                            true,
                            "Test your accuracy and reaction speed by hitting targets."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Space Shooter",
                            "Action",
                            true,
                            "Defeat incoming enemies and survive the space battle for a high score."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Speed Racer",
                            "Racing",
                            false,
                            "Leaderboard-based racing challenge where players can submit their scores."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Penalty Pro",
                            "Sports",
                            false,
                            "Football penalty challenge with score submission through the leaderboard."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Boxing Arena",
                            "Sports",
                            false,
                            "Boxing challenge with player scores recorded on the leaderboard."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Puzzle Quest",
                            "Puzzle",
                            false,
                            "Puzzle challenge where players can submit their achieved scores."
                    )
            );

            gameRepository.save(
                    new Game(
                            "Archery Masters",
                            "Sports",
                            false,
                            "Archery scoring challenge with leaderboard-based score submission."
                    )
            );

            System.out.println("GAMECORE games initialized successfully.");
        };
    }
}