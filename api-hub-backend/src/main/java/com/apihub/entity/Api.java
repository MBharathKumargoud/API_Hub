package com.apihub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One API in the directory (the 50 records from the frontend's apiData.js).
 * "slug" is the frontend's string id (for example "openai"). It is unique and is what
 * the React routes use (/api/openai), so it is also what we expose as "id" in JSON.
 */
@Entity
@Table(name = "apis",
        uniqueConstraints = @UniqueConstraint(name = "uk_apis_slug", columnNames = "slug"))
@Getter
@Setter
@NoArgsConstructor
public class Api {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String slug;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 100)
    private String provider;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 50)
    private String icon;

    @Column(length = 30)
    private String color;

    @Column(name = "authentication_type", length = 150)
    private String authenticationType;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "documentation_url", length = 500)
    private String documentationUrl;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "free_tier", length = 500)
    private String freeTier;

    @Column(length = 200)
    private String pricing;
}
