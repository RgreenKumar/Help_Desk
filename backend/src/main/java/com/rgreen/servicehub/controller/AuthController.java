package com.rgreen.servicehub.controller;

import com.rgreen.servicehub.dto.AdminSetupRequest;
import com.rgreen.servicehub.dto.LoginRequest;
import com.rgreen.servicehub.dto.LoginResponse;
import com.rgreen.servicehub.dto.SetupCheckResponse;
import com.rgreen.servicehub.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/check-setup")
    public ResponseEntity<SetupCheckResponse> checkSetup() {
        return ResponseEntity.ok(authService.checkSetup());
    }

    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(@RequestBody AdminSetupRequest request) {
        authService.setupAdmin(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
