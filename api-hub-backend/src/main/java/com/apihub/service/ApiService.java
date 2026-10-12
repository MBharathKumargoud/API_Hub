package com.apihub.service;

import com.apihub.dto.ApiResponse;
import com.apihub.entity.Api;
import com.apihub.exception.ResourceNotFoundException;
import com.apihub.repository.ApiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ApiService {

    private final ApiRepository apiRepository;

    public ApiService(ApiRepository apiRepository) {
        this.apiRepository = apiRepository;
    }

    /** All APIs, optionally filtered by a search text, category and/or provider. */
    public List<ApiResponse> search(String query, String category, String provider) {
        String pattern = blankToNull(query) == null ? null : "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
        return apiRepository.search(pattern, blankToNull(category), blankToNull(provider))
                .stream().map(ApiResponse::from).toList();
    }

    public ApiResponse getBySlug(String slug) {
        return ApiResponse.from(findEntity(slug));
    }

    public Api findEntity(String slug) {
        return apiRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("API not found: " + slug));
    }

    public List<String> categories() {
        return apiRepository.findDistinctCategories();
    }

    public List<String> providers() {
        return apiRepository.findDistinctProviders();
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
