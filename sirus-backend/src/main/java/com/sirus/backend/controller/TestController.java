package com.sirus.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TestController {
    
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
} 