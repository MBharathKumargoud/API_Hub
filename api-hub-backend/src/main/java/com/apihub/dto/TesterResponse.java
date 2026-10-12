package com.apihub.dto;

import java.util.Map;

public record TesterResponse(int status, String statusText, long durationMs,
                             Map<String, String> headers, String body, boolean truncated) {
}
