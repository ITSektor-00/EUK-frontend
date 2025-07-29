package com.sirus.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastResetTime = new ConcurrentHashMap<>();
    
    private static final int MAX_REQUESTS_PER_MINUTE = 100; // Povećano za EUK domene
    private static final long RESET_INTERVAL = 60000; // 1 minute

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIpAddress(request);
        String origin = request.getHeader("Origin");
        String key = clientIp + ":" + request.getRequestURI();
        
        // Posebna pravila za EUK domene
        boolean isEukDomain = origin != null && (
            origin.contains("euk.vercel.app") || 
            origin.contains("euk-it-sectors-projects.vercel.app")
        );
        
        // Veći limit za EUK domene
        int maxRequests = isEukDomain ? 150 : MAX_REQUESTS_PER_MINUTE;
        
        long currentTime = System.currentTimeMillis();
        
        // Reset counter if interval has passed
        lastResetTime.computeIfAbsent(key, k -> currentTime);
        if (currentTime - lastResetTime.get(key) > RESET_INTERVAL) {
            requestCounts.remove(key);
            lastResetTime.put(key, currentTime);
        }
        
        // Increment request count
        AtomicInteger count = requestCounts.computeIfAbsent(key, k -> new AtomicInteger(0));
        int currentCount = count.incrementAndGet();
        
        if (currentCount > maxRequests) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }
        
        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(maxRequests - currentCount));
        response.setHeader("X-RateLimit-Reset", String.valueOf(lastResetTime.get(key) + RESET_INTERVAL));
        
        filterChain.doFilter(request, response);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 