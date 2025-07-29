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
} 