package com.rgreen.servicehub.dto;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private String name;
}
