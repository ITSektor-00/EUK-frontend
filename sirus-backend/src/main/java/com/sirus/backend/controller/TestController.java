package com.sirus.backend.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"https://euk.vercel.app", "https://euk-it-sectors-projects.vercel.app"})
public class TestController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "SIRUS Backend");
        response.put("version", "1.0.0");
        return response;
    }

    @GetMapping("/euk-status")
    public Map<String, Object> eukStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "EUK Domains Configured");
        response.put("timestamp", LocalDateTime.now());
        response.put("allowedDomains", new String[]{
            "https://euk.vercel.app",
            "https://euk-it-sectors-projects.vercel.app"
        });
        response.put("corsEnabled", true);
        response.put("rateLimitEnabled", true);
        response.put("maxRequestsPerMinute", 150);
        return response;
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    // Stari endpoint-i koje frontend poziva
    @GetMapping("/hello")
    public String hello() {
        return "Hello from EUK Backend!";
    }
    
    @GetMapping("/status")
    public String status() {
        return "EUK Backend is running!";
    }
    
    @PostMapping("/echo")
    public String echo(@RequestBody String message) {
        return "Echo: " + message;
    }

    // CORS test endpoint
    @GetMapping("/cors-test")
    public Map<String, Object> corsTest(@RequestHeader(value = "Origin", required = false) String origin) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS test successful");
        response.put("origin", origin);
        response.put("timestamp", LocalDateTime.now());
        response.put("allowedOrigins", new String[]{
            "https://euk.vercel.app",
            "https://euk-it-sectors-projects.vercel.app"
        });
        return response;
    }

    // Fetch test endpoint
    @PostMapping("/fetch-test")
    public Map<String, Object> fetchTest(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Fetch test successful");
        response.put("receivedData", request);
        response.put("timestamp", LocalDateTime.now());
        response.put("method", "POST");
        return response;
    }

    // Username availability test endpoint
    @GetMapping("/username-test")
    public Map<String, Object> usernameTest(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("available", username.length() >= 3); // Simulacija provere
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Username availability test");
        return response;
    }

    // Registration test endpoint
    @PostMapping("/registration-test")
    public Map<String, Object> registrationTest(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration test successful");
        response.put("receivedData", request);
        response.put("timestamp", LocalDateTime.now());
        response.put("method", "POST");
        response.put("status", "success");
        response.put("userId", "test-user-123");
        return response;
    }

    // Username availability simulation
    @GetMapping("/check-username-test")
    public Map<String, Object> checkUsernameTest(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        
        // Simulacija provere - neki username-ovi su zauzeti
        boolean isAvailable = !username.equalsIgnoreCase("admin") && 
                             !username.equalsIgnoreCase("test") && 
                             !username.equalsIgnoreCase("user") &&
                             username.length() >= 3;
        
        response.put("username", username);
        response.put("available", isAvailable);
        response.put("timestamp", LocalDateTime.now());
        response.put("message", isAvailable ? "Username is available" : "Username already exists");
        
        return response;
    }
} 