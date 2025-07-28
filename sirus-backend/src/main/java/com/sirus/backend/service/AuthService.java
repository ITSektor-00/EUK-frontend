package com.sirus.backend.service;

import com.sirus.backend.dto.SignInRequest;
import com.sirus.backend.dto.SignUpRequest;
import com.sirus.backend.dto.AuthResponse;
import com.sirus.backend.entity.User;
import com.sirus.backend.repository.UserRepository;
import com.sirus.backend.exception.AuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    public AuthResponse signUp(SignUpRequest request) {
        // Proveri da li korisnik već postoji
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Korisničko ime već postoji", "USERNAME_EXISTS");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email adresa već postoji", "EMAIL_EXISTS");
        }
        
        // Kreiraj novog korisnika
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        User savedUser = userRepository.save(user);
        
        // Generiši JWT token
        String token = jwtService.generateToken(savedUser);
        
        return createAuthResponse(savedUser, token);
    }
    
    public AuthResponse signIn(SignInRequest request) {
        // Pronađi korisnika po korisničkom imenu ili email-u
        User user = null;
        
        // Prvo pokušaj da pronađeš po korisničkom imenu
        user = userRepository.findByUsername(request.getUsernameOrEmail()).orElse(null);
        
        // Ako nije pronađen po korisničkom imenu, pokušaj po email-u
        if (user == null) {
            user = userRepository.findByEmail(request.getUsernameOrEmail()).orElse(null);
        }
        
        // Ako korisnik nije pronađen
        if (user == null) {
            throw new AuthException("Pogrešno korisničko ime ili email", "INVALID_USERNAME_EMAIL");
        }
        
        // Proveri lozinku
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Pogrešna lozinka", "INVALID_PASSWORD");
        }
        
        // Proveri da li je korisnik aktivan
        if (!user.isActive()) {
            throw new AuthException("Nalog je deaktiviran", "ACCOUNT_DEACTIVATED");
        }
        
        // Generiši JWT token
        String token = jwtService.generateToken(user);
        
        return createAuthResponse(user, token);
    }
    
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    private AuthResponse createAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
} 