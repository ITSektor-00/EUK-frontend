package com.sirus.backend.controller;

import com.sirus.backend.dto.SignInRequest;
import com.sirus.backend.dto.SignUpRequest;
import com.sirus.backend.dto.AuthResponse;
import com.sirus.backend.dto.ErrorResponse;
import com.sirus.backend.dto.UsernameAvailabilityResponse;
import com.sirus.backend.entity.User;
import com.sirus.backend.service.AuthService;
import com.sirus.backend.service.JwtService;
import com.sirus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"https://euk.vercel.app", "https://euk-it-sectors-projects.vercel.app"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
        try {
            // Debug logging - ispiši sve podatke
            logger.info("=== SIGNUP REQUEST DEBUG ===");
            logger.info("Request object: {}", request);
            logger.info("Username: '{}'", request.getUsername());
            logger.info("Email: '{}'", request.getEmail());
            logger.info("Password: '{}'", request.getPassword() != null ? "***" : "NULL");
            logger.info("FirstName: '{}'", request.getFirstName());
            logger.info("LastName: '{}'", request.getLastName());
            logger.info("==========================");
            
            // Validacija
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                logger.error("Username is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Korisničko ime je obavezno", "/api/auth/signup"));
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                logger.error("Email is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Email adresa je obavezna", "/api/auth/signup"));
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                logger.error("Password is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Lozinka je obavezna", "/api/auth/signup"));
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                logger.error("FirstName is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Ime je obavezno", "/api/auth/signup"));
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                logger.error("LastName is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Prezime je obavezno", "/api/auth/signup"));
            }
            
            AuthResponse response = authService.signUp(request);
            logger.info("User {} successfully registered", request.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during signup: {}", e.getMessage(), e);
            // GlobalExceptionHandler će hendlati AuthException
            throw e;
        }
    }
    
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            // Debug logging za signin
            logger.info("=== SIGNIN REQUEST DEBUG ===");
            logger.info("Request object: {}", request);
            logger.info("UsernameOrEmail: '{}'", request.getUsernameOrEmail());
            logger.info("Password: '{}'", request.getPassword() != null ? "***" : "NULL");
            logger.info("==========================");
            
            // Validacija
            if (request.getUsernameOrEmail() == null || request.getUsernameOrEmail().trim().isEmpty()) {
                logger.error("UsernameOrEmail is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Korisničko ime ili email je obavezan", "/api/auth/signin"));
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                logger.error("Password is null or empty");
                return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", "Lozinka je obavezna", "/api/auth/signin"));
            }
            
            AuthResponse response = authService.signIn(request);
            logger.info("User {} successfully signed in", request.getUsernameOrEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during signin: {}", e.getMessage(), e);
            // GlobalExceptionHandler će hendlati AuthException
            throw e;
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("=== GET CURRENT USER DEBUG ===");
            logger.info("Auth header: {}", authHeader);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer "
            logger.info("Token: {}", token);
            
            if (!jwtService.validateToken(token)) {
                logger.error("Invalid token");
                return ResponseEntity.status(401).body("Invalid token");
            }
            
            String username = jwtService.getUsernameFromToken(token);
            logger.info("Username from token: {}", username);
            
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.info("User found: {}", user.getUsername());
            
            // Vrati user data
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole(),
                "isActive", user.isActive()
            ));
            
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage(), e);
            return ResponseEntity.status(401).body("Error getting current user: " + e.getMessage());
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth API is working!");
    }
    
    @GetMapping("/check-username")
    public ResponseEntity<UsernameAvailabilityResponse> checkUsernameAvailability(
            @RequestParam String username) {
        try {
            logger.info("Checking username availability for: '{}'", username);
            
            // Validacija
            if (username == null || username.trim().isEmpty()) {
                logger.error("Username parameter is null or empty");
                return ResponseEntity.badRequest().body(new UsernameAvailabilityResponse(false, username));
            }
            
            boolean isAvailable = authService.isUsernameAvailable(username.trim());
            
            logger.info("Username '{}' availability: {}", username, isAvailable);
            
            return ResponseEntity.ok(new UsernameAvailabilityResponse(isAvailable, username));
            
        } catch (Exception e) {
            logger.error("Error checking username availability: {}", e.getMessage(), e);
            return ResponseEntity.ok(new UsernameAvailabilityResponse(false, username));
        }
    }
} 