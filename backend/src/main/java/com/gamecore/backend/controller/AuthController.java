package com.gamecore.backend.controller;

import com.gamecore.backend.entity.User;
import com.gamecore.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }


    // ==============================
    // REGISTER
    // ==============================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        System.out.println(
                "Username: " + request.getUsername()
        );

        System.out.println(
                "Email: " + request.getEmail()
        );

        System.out.println(
                "Password received: " +
                (request.getPassword() != null)
        );

        try {

            userService.registerUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword()
            );

            return ResponseEntity.ok(
                    "Registration successful"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ==============================
    // LOGIN
    // ==============================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user =
                userService.loginUser(
                        request.getEmail(),
                        request.getPassword()
                );

        if (user == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }


        return ResponseEntity.ok(
                new LoginResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail()
                )
        );
    }


    // ==============================
    // REGISTER REQUEST
    // ==============================

    public static class RegisterRequest {

        private String username;
        private String email;
        private String password;


        public String getUsername() {
            return username;
        }


        public void setUsername(
                String username) {

            this.username = username;
        }


        public String getEmail() {
            return email;
        }


        public void setEmail(
                String email) {

            this.email = email;
        }


        public String getPassword() {
            return password;
        }


        public void setPassword(
                String password) {

            this.password = password;
        }
    }


    // ==============================
    // LOGIN REQUEST
    // ==============================

    public static class LoginRequest {

        private String email;
        private String password;


        public String getEmail() {
            return email;
        }


        public void setEmail(
                String email) {

            this.email = email;
        }


        public String getPassword() {
            return password;
        }


        public void setPassword(
                String password) {

            this.password = password;
        }
    }


    // ==============================
    // LOGIN RESPONSE
    // ==============================

    public static class LoginResponse {

        private Long id;
        private String username;
        private String email;


        public LoginResponse(
                Long id,
                String username,
                String email) {

            this.id = id;
            this.username = username;
            this.email = email;
        }


        public Long getId() {
            return id;
        }


        public String getUsername() {
            return username;
        }


        public String getEmail() {
            return email;
        }
    }
}