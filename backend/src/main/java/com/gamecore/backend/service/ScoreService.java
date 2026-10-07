package com.gamecore.backend.service;

import com.gamecore.backend.entity.Game;
import com.gamecore.backend.entity.Score;
import com.gamecore.backend.entity.User;
import com.gamecore.backend.repository.GameRepository;
import com.gamecore.backend.repository.ScoreRepository;
import com.gamecore.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public ScoreService(
            ScoreRepository scoreRepository,
            UserRepository userRepository,
            GameRepository gameRepository) {

        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
    }


    // Submit a score
    public Score submitScore(
            Long userId,
            Long gameId,
            int score) {

        // Check user
        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));


        // Check game
        Game game =
                gameRepository.findById(gameId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Game not found"
                                ));


        // Validate score
        if (score < 0) {

            throw new RuntimeException(
                    "Score cannot be negative"
            );
        }


        // Check if player already has a score
        Score existingScore =
                scoreRepository
                        .findByUserIdAndGameId(
                                userId,
                                gameId
                        )
                        .orElse(null);


        // =========================================
        // FIRST SCORE
        // =========================================

        if (existingScore == null) {

            Score newScore =
                    new Score(
                            user,
                            game,
                            score
                    );

            return scoreRepository.save(
                    newScore
            );
        }


        // =========================================
        // NEW HIGH SCORE
        // =========================================

        if (score > existingScore.getScore()) {

            existingScore.setScore(score);

            existingScore.setAchievedAt(
                    java.time.LocalDateTime.now()
            );

            return scoreRepository.save(
                    existingScore
            );
        }


        // =========================================
        // LOWER / SAME SCORE
        // =========================================

        // Do not create a new database record.
        // Return the existing best score.

        return existingScore;
    }


    // Get leaderboard for one game
    public List<Score> getGameLeaderboard(
            Long gameId) {

        return scoreRepository
                .findByGameIdOrderByScoreDesc(gameId);
    }


    // Get all scores
    public List<Score> getGlobalLeaderboard() {

        return scoreRepository
                .findAllByOrderByScoreDesc();
    }


    // Get player's score history
    public List<Score> getUserScores(
            Long userId) {

        return scoreRepository
                .findByUserIdOrderByAchievedAtDesc(
                        userId
                );
    }
}