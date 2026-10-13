package com.apihub.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class SmtpEmailService implements EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(SmtpEmailService.class);

    private final boolean enabled;
    private final String from;
    private final long expiryMinutes;
    private final String apiKey;

    public SmtpEmailService(
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.from}") String from,
            @Value("${app.password-reset.expiry-minutes:10}")
            long expiryMinutes,
            @Value("${app.mail.resend-api-key:}") String apiKey) {

        this.enabled = enabled;
        this.from = from;
        this.expiryMinutes = expiryMinutes;
        this.apiKey = apiKey;
    }

    @Async
    @Override
    public void sendPasswordResetOtp(
            String toEmail,
            String userName,
            String otp) {

        if (!enabled) {
            log.warn(
                    "[DEV] Email disabled. OTP generated for {} but not emailed.",
                    toEmail
            );
            return;
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.error(
                    "Cannot send password reset email: Resend API key is missing."
            );
            return;
        }

        try {
            Resend resend = new Resend(apiKey);

            String safeName = HtmlUtils.htmlEscape(userName);
            String safeOtp = HtmlUtils.htmlEscape(otp);

            String plainText =
                    "Hi " + userName + ",\n\n"
                    + "Your API Hub password reset code is: " + otp + "\n\n"
                    + "It is valid for " + expiryMinutes + " minutes.\n"
                    + "Never share this code with anyone.\n\n"
                    + "If you did not request a password reset, "
                    + "you can ignore this email.";

            String html =
                    "<div style=\"font-family:Arial,sans-serif;"
                    + "max-width:480px;margin:auto;\">"
                    + "<h2>Reset your API Hub password</h2>"
                    + "<p>Hi " + safeName + ",</p>"
                    + "<p>Use the following one-time password reset code:</p>"
                    + "<div style=\"font-size:32px;font-weight:bold;"
                    + "letter-spacing:8px;background:#f3f4f6;"
                    + "padding:16px;border-radius:8px;"
                    + "display:inline-block;\">"
                    + safeOtp
                    + "</div>"
                    + "<p>This code expires in "
                    + expiryMinutes + " minutes.</p>"
                    + "<p>Never share this code with anyone.</p>"
                    + "<p>If you did not request a password reset, "
                    + "you can ignore this email.</p>"
                    + "</div>";

            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(from)
                    .to(toEmail)
                    .subject("Your API Hub password reset code")
                    .text(plainText)
                    .html(html)
                    .build();

            CreateEmailResponse response = resend.emails().send(options);

            log.info(
                    "Password reset email submitted to Resend for {}. Email ID: {}",
                    toEmail,
                    response.getId()
            );

        } catch (ResendException | RuntimeException e) {
            log.error(
                    "Failed to submit password reset email to Resend for {}: {}",
                    toEmail,
                    e.getMessage()
            );
        }
    }
}