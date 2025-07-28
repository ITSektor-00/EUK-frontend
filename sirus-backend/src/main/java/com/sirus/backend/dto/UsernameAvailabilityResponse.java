package com.sirus.backend.dto;

public class UsernameAvailabilityResponse {
    private boolean available;
    private String username;
    
    public UsernameAvailabilityResponse() {
    }
    
    public UsernameAvailabilityResponse(boolean available, String username) {
        this.available = available;
        this.username = username;
    }
    
    // Getters and Setters
    public boolean isAvailable() {
        return available;
    }
    
    public void setAvailable(boolean available) {
        this.available = available;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
} 