package com.apihub.dto;

import java.time.Instant;

public record RecentRequest(String apiId, String apiName, String method, String endpoint,
                            Integer statusCode, long durationMs, Instant timestamp) {
}
