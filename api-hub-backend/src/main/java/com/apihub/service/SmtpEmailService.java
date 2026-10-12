package com.apihub.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

/**
 * Sends the real email over SMTP (for example Gmail).
 * Runs in the background (@Async) so the user does not wait for the mail server,
 * and so the response time does not reveal whether an email address exists.
 */
@Service
public class SmtpEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;
    private final long expiryMinutes;

    public SmtpEmailService(JavaMailSender mailSender,
                            @Value("${app.mail.enabled}") boolean enabled,
                            @Value("${app.mail.from}") String from,
                            @Value("${app.password-reset.expiry-minutes}") long expiryMinutes) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
        this.expiryMinutes = expiryMinutes;
    }

    @Async
    @Override
    public void sendPasswordResetOtp(String toEmail, String userName, String otp) {
        if (!enabled) {
            // Development mode: print the code instead of emailing it.
            log.warn("[DEV] MAIL_ENABLED=false, so no email was sent. Password reset OTP for {}: {}", toEmail, otp);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true = multipart: allows plain text + HTML versions
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject("Your API Hub password reset code: " + otp);

            String plain = "Hi " + userName + ",\n\n"
                    + "Your API Hub password reset code (OTP) is: " + otp + "\n\n"
                    + "It is valid for " + expiryMinutes + " minutes. Do not share it with anyone.\n"
                    + "If you did not request this, you can ignore this email; your password stays the same.\n";
            String html = "<div style=\"font-family:Arial,sans-serif;max-width:480px\">"
                    + "<h2>Reset your password</h2>"
                    + "<p>Hi " + HtmlUtils.htmlEscape(userName) + ",</p>"
                    + "<p>Use this one-time code (OTP) to reset your API Hub password:</p>"
                    + "<p style=\"font-size:32px;font-weight:bold;letter-spacing:8px;background:#f3f4f6;"
                    + "padding:14px 20px;border-radius:8px;display:inline-block\">" + otp + "</p>"
                    + "<p>The code is valid for " + expiryMinutes + " minutes. Never share it with anyone.</p>"
                    + "<p style=\"color:#666;font-size:13px\">If you did not request this, ignore this email. "
                    + "Your password will not change.</p></div>";
            helper.setText(plain, html);
            mailSender.send(message);
            log.info("Password reset OTP email sent to {}", toEmail);
        } catch (MessagingException | MailException | IllegalStateException e) {
            // Never tell the client; just log (without the code) so the developer can fix SMTP settings.
            log.error("Could not send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}