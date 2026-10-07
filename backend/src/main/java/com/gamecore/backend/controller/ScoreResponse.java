package com.gamecore.backend.controller;

import com.gamecore.backend.entity.Score;

import java.time.LocalDateTime;

public class ScoreResponse {

    private Long id;
    private Long userId;
    private String username;
    private Long gameId;
    private String gameName;
    private int score;
    private LocalDateTime achievedAt;

    public ScoreResponse(Score score) {

        this.id = score.getId();

        this.userId =
                score.getUser().getId();

        this.username =
                score.getUser().getUsername();

        this.gameId =
                score.getGame().getId();

        this.gameName =
                score.getGame().getName();

        this.score =
                score.getScore();

        this.achievedAt =
                score.getAchievedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Long getGameId() {
        return gameId;
    }

    public String getGameName() {
        return gameName;
    }

    public int getScore() {
        return score;
    }

    public LocalDateTime getAchievedAt() {
        return achievedAt;
    }
}