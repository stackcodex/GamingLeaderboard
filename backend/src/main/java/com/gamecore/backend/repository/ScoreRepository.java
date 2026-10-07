package com.gamecore.backend.repository;

import com.gamecore.backend.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findAllByOrderByScoreDesc();

    List<Score> findByGameIdOrderByScoreDesc(Long gameId);

    List<Score> findByUserIdOrderByScoreDesc(Long userId);

    List<Score> findByUserIdOrderByAchievedAtDesc(Long userId);

    Optional<Score> findByUserIdAndGameId(Long userId, Long gameId);
}