package com.apihub.controller;

import com.apihub.dto.AuthResponse;
import com.apihub.dto.ForgotPasswordRequest;
import com.apihub.dto.LoginRequest;
import com.apihub.dto.MessageResponse;
import com.apihub.dto.ResetPasswordRequest;
import com.apihub.dto.RegisterRequest;
import com.apihub.dto.UserResponse;
import com.apihub.service.AuthService;
import com.apihub.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(authService.getByEmail(authentication.getName()));
    }

    /** Step 1: user enters their email. The answer is always the same, even for unknown emails. */
    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestOtp(request.email());
        return new MessageResponse("If an account exists for that email, a 6-digit OTP has been sent to it.");
    }

    /** Step 2: user submits the OTP from the email together with a new password. */
    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.email(), request.otp(), request.newPassword());
        return new MessageResponse("Your password has been reset. You can now log in.");
    }
}
