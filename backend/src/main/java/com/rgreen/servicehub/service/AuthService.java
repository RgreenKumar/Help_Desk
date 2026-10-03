package com.rgreen.servicehub.service;

import com.rgreen.servicehub.dto.AdminSetupRequest;
import com.rgreen.servicehub.dto.LoginRequest;
import com.rgreen.servicehub.dto.LoginResponse;
import com.rgreen.servicehub.dto.SetupCheckResponse;
import com.rgreen.servicehub.model.Role;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.repository.UserRepository;
import com.rgreen.servicehub.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public SetupCheckResponse checkSetup() {
        return new SetupCheckResponse(
                !userRepository.existsByRole(Role.ADMIN)
        );
    }

    public void setupAdmin(AdminSetupRequest request) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new RuntimeException("Admin already exists");
        }

        User admin = new User();

        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        admin.setRole(Role.ADMIN);
        admin.setAdminId(request.getAdminId());
        admin.setStatus("active");

        userRepository.save(admin);
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Role selectedRole = convertRole(request.getRole());

        if (selectedRole != user.getRole()) {
            throw new RuntimeException(
                    "Selected role does not match this account"
            );
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        String name =
                (user.getFirstName() + " " + user.getLastName()).trim();

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                name
        );
    }

    private Role convertRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new RuntimeException("Role is required");
        }

        String normalizedRole = role
                .trim()
                .replace(" ", "_")
                .toUpperCase();

        try {
            return Role.valueOf(normalizedRole);
        } catch (IllegalArgumentException exception) {
            throw new RuntimeException("Invalid role");
        }
    }
}