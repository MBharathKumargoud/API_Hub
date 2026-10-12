package com.apihub.dto;

import java.util.List;

public record DashboardResponse(long totalApis, long savedApis, long projects,
                                long requestsMade, List<RecentRequest> recentRequests) {
}
