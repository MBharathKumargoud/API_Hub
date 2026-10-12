package com.apihub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * One request sent through the API tester. We store the endpoint WITHOUT its query string and
 * never store headers or bodies, because those may contain the user's secret API keys.
 */
@Entity
@Table(name = "api_request_history")
@Getter
@Setter
@NoArgsConstructor
public class ApiRequestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_id", nullable = false)
    private Api api;

    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod;

    @Column(nullable = false, length = 500)
    private String endpoint;

    /** null when the provider could not be reached (timeout, connection error). */
    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "duration_ms", nullable = false)
    private long durationMs;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
