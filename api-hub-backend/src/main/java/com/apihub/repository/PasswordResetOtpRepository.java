package com.apihub.repository;

import com.apihub.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findFirstByUserIdOrderByIdDesc(Long userId);

    boolean existsByUserIdAndCreatedAtAfter(Long userId, Instant after);

    void deleteByUserId(Long userId);
}
