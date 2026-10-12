package com.apihub.config;

import com.apihub.entity.Api;
import com.apihub.repository.ApiRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * On startup, inserts the 50 APIs from src/main/resources/seed/apis.json
 * (an exact export of the frontend's apiData.js) into the "apis" table.
 *
 * It only inserts APIs whose slug is missing, so restarting never creates duplicates
 * and never overwrites anything you changed in the database.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    /** Mirrors one object of apiData.js. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    record SeedApi(String id, String name, String category, String provider, String description,
                   String icon, String color, String authentication, String baseUrl,
                   String documentation, String website, String freeTier, String pricing) {
    }

    private final ApiRepository apiRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(ApiRepository apiRepository, ObjectMapper objectMapper) {
        this.apiRepository = apiRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        List<SeedApi> seeds;
        try (InputStream in = new ClassPathResource("seed/apis.json").getInputStream()) {
            seeds = objectMapper.readValue(in, new TypeReference<List<SeedApi>>() {
            });
        }

        Set<String> existing = new HashSet<>();
        apiRepository.findAll().forEach(a -> existing.add(a.getSlug()));

        List<Api> toInsert = seeds.stream()
                .filter(s -> !existing.contains(s.id()))
                .map(DataSeeder::toEntity)
                .toList();
        apiRepository.saveAll(toInsert);

        log.info("API seeding finished: {} inserted, {} already present, {} total in database",
                toInsert.size(), seeds.size() - toInsert.size(), apiRepository.count());
    }

    private static Api toEntity(SeedApi s) {
        Api a = new Api();
        a.setSlug(s.id());
        a.setName(s.name());
        a.setCategory(s.category());
        a.setProvider(s.provider());
        a.setDescription(s.description());
        a.setIcon(s.icon());
        a.setColor(s.color());
        a.setAuthenticationType(s.authentication());
        a.setBaseUrl(s.baseUrl());
        a.setDocumentationUrl(s.documentation());
        a.setWebsiteUrl(s.website());
        a.setFreeTier(s.freeTier());
        a.setPricing(s.pricing());
        return a;
    }
}
