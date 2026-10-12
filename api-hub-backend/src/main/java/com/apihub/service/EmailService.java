package com.apihub.service;

/** Sends emails. An interface so tests can replace the real SMTP sender. */
public interface EmailService {

    void sendPasswordResetOtp(String toEmail, String userName, String otp);
}
