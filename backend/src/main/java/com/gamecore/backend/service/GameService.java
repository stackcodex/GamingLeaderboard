package com.gamecore.backend.service;

import com.gamecore.backend.entity.Game;
import com.gamecore.backend.repository.GameRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // Get all games
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    // Get game by ID
    public Game getGameById(Long id) {
        return gameRepository.findById(id)
                .orElse(null);
    }

    // Add a new game
    public Game addGame(Game game) {

        if (gameRepository.existsByName(game.getName())) {
            throw new RuntimeException("Game already exists");
        }

        return gameRepository.save(game);
    }
}