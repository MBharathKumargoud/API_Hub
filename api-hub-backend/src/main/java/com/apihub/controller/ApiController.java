package com.apihub.controller;

import com.apihub.dto.ApiResponse;
import com.apihub.service.ApiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public API directory. Filtering is done with query parameters: /api/apis?query=weather&category=Weather */
@RestController
@RequestMapping("/api/apis")
public class ApiController {

    private final ApiService apiService;

    public ApiController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping
    public List<ApiResponse> list(@RequestParam(required = false) String query,
                                  @RequestParam(required = false) String category,
                                  @RequestParam(required = false) String provider) {
        return apiService.search(query, category, provider);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return apiService.categories();
    }

    @GetMapping("/providers")
    public List<String> providers() {
        return apiService.providers();
    }

    @GetMapping("/{id}")
    public ApiResponse get(@PathVariable("id") String id) {
        return apiService.getBySlug(id);
    }
}
