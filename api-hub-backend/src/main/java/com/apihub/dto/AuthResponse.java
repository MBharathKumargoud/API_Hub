package com.apihub.dto;

public record AuthResponse(String token, String tokenType, long expiresInSeconds, UserResponse user) {
}
