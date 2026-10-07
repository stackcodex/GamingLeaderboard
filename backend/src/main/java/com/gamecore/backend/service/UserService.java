package com.gamecore.backend.service;

import com.gamecore.backend.entity.User;
import com.gamecore.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // ==============================
    // REGISTER USER
    // ==============================

    public User registerUser(
            String username,
            String email,
            String password) {

        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }


        if (userRepository.existsByUsername(username)) {

            throw new RuntimeException(
                    "Username already taken"
            );
        }


        String encodedPassword =
                passwordEncoder.encode(password);


        User user =
                new User(
                        username,
                        email,
                        encodedPassword
                );


        return userRepository.save(user);
    }


    // ==============================
    // LOGIN USER
    // ==============================

    public User loginUser(
            String email,
            String password) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user == null) {

            return null;
        }


        if (
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                )
        ) {

            return user;
        }


        return null;
    }


    // ==============================
    // GET USERNAME BY EMAIL
    // ==============================

    public String getUsernameByEmail(
            String email) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);


        if (user == null) {

            return null;
        }


        return user.getUsername();
    }
}