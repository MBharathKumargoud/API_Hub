package com.apihub.service;

import com.apihub.entity.PasswordResetOtp;
import com.apihub.entity.User;
import com.apihub.exception.BadRequestException;
import com.apihub.repository.PasswordResetOtpRepository;
import com.apihub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;

/**
 * Forgot-password flow with a one-time code:
 *  1. requestOtp(email)                     -> generates a random 6-digit OTP and emails it
 *  2. resetPassword(email, otp, newPassword) -> checks the OTP, saves the new BCrypt password, deletes the OTP
 */
@Service
@Transactional
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    static final String INVALID_OTP = "The OTP is invalid or has expired. Please request a new one.";
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final long expiryMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetOtpRepository otpRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                @Value("${app.password-reset.expiry-minutes}") long expiryMinutes) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
    }

    /** Always returns normally, whether or not the email exists, so nobody can probe which emails are registered. */
    public void requestOtp(String rawEmail) {
        String email = normalize(rawEmail);
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            log.info("Forgot-password: no account is registered with {} (nothing sent)", email);
            return;
        }
        createOtpAndSendEmail(user.get());
    }

    private void createOtpAndSendEmail(User user) {
        Instant now = Instant.now();
        // Anti-spam: at most one email per minute per account.
        if (otpRepository.existsByUserIdAndCreatedAtAfter(user.getId(), now.minusSeconds(RESEND_COOLDOWN_SECONDS))) {
            log.info("Forgot-password: an OTP for {} was created less than {}s ago, not sending another yet",
                    user.getEmail(), RESEND_COOLDOWN_SECONDS);
            return;
        }
        otpRepository.deleteByUserId(user.getId()); // an older code stops working

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        PasswordResetOtp entity = new PasswordResetOtp();
        entity.setUser(user);
        entity.setOtpHash(passwordEncoder.encode(otp));
        entity.setExpiresAt(now.plus(expiryMinutes, ChronoUnit.MINUTES));
        otpRepository.save(entity);

        log.info("Forgot-password: OTP created for {}, handing it to the email sender", user.getEmail());
        emailService.sendPasswordResetOtp(user.getEmail(), user.getName(), otp);
    }

    /**
     * noRollbackFor: when the code is wrong we throw an error, but the "wrong attempts" counter
     * must still be saved, otherwise someone could guess forever.
     */
    @Transactional(noRollbackFor = BadRequestException.class)
    public void resetPassword(String rawEmail, String otp, String newPassword) {
        User user = userRepository.findByEmail(normalize(rawEmail))
                .orElseThrow(() -> new BadRequestException(INVALID_OTP));
        PasswordResetOtp saved = otpRepository.findFirstByUserIdOrderByIdDesc(user.getId())
                .orElseThrow(() -> new BadRequestException(INVALID_OTP));

        if (saved.getExpiresAt().isBefore(Instant.now()) || saved.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.delete(saved);
            throw new BadRequestException(INVALID_OTP);
        }
        if (!passwordEncoder.matches(otp, saved.getOtpHash())) {
            saved.setAttempts(saved.getAttempts() + 1);
            if (saved.getAttempts() >= MAX_ATTEMPTS) {
                otpRepository.delete(saved); // too many wrong guesses: this code is dead
            } else {
                otpRepository.save(saved);
            }
            throw new BadRequestException(INVALID_OTP);
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpRepository.deleteByUserId(user.getId()); // single use
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}