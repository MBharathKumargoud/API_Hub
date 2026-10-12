package com.apihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Map;

/** A request the user wants API Hub to send to an API provider on their behalf. */
public record TesterRequest(
        @NotBlank(message = "apiId is required") String apiId,

        @NotBlank(message = "method is required")
        @Pattern(regexp = "(?i)GET|POST|PUT|PATCH|DELETE", message = "method must be GET, POST, PUT, PATCH or DELETE")
        String method,

        @NotBlank(message = "url is required")
        @Size(max = 2000, message = "url is too long")
        String url,

        Map<String, String> queryParams,
        Map<String, String> headers,

        @Size(max = 100000, message = "body is too large (max 100 KB)")
        String body) {
}
