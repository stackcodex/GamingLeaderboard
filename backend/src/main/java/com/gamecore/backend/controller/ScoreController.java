package com.gamecore.backend.controller;

import com.gamecore.backend.entity.Score;
import com.gamecore.backend.service.ScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    // SUBMIT SCORE
    @PostMapping
    public ResponseEntity<?> submitScore(
            @RequestParam Long userId,
            @RequestParam Long gameId,
            @RequestParam int score) {

        try {

            Score savedScore =
                    scoreService.submitScore(
                            userId,
                            gameId,
                            score
                    );

            return ResponseEntity.ok(
                    new ScoreResponse(savedScore)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // GAME LEADERBOARD
    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<ScoreResponse>> getGameLeaderboard(
            @PathVariable Long gameId) {

        List<ScoreResponse> leaderboard =
                scoreService
                        .getGameLeaderboard(gameId)
                        .stream()
                        .map(ScoreResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    // GLOBAL LEADERBOARD
    @GetMapping("/global")
    public ResponseEntity<List<ScoreResponse>> getGlobalLeaderboard() {

        List<ScoreResponse> leaderboard =
                scoreService
                        .getGlobalLeaderboard()
                        .stream()
                        .map(ScoreResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    // USER SCORE HISTORY
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ScoreResponse>> getUserScores(
            @PathVariable Long userId) {

        List<ScoreResponse> scores =
                scoreService
                        .getUserScores(userId)
                        .stream()
                        .map(ScoreResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(scores);
    }
}