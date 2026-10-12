package com.apihub.dto;

import com.apihub.entity.User;

import java.time.Instant;

/** What we send about a user. Never contains the password hash. */
public record UserResponse(Long id, String name, String email, String role, Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getCreatedAt());
    }
}
