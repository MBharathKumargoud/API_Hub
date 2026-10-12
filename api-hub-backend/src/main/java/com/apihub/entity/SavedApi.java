package com.apihub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/** "User bookmarked API" (the Save API button). A user can save a given API only once. */
@Entity
@Table(name = "saved_apis",
        uniqueConstraints = @UniqueConstraint(name = "uk_saved_user_api", columnNames = {"user_id", "api_id"}))
@Getter
@Setter
@NoArgsConstructor
public class SavedApi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_id", nullable = false)
    private Api api;

    @CreationTimestamp
    @Column(name = "saved_at", nullable = false, updatable = false)
    private Instant savedAt;
}
