package com.apihub.service;

import com.apihub.dto.DashboardResponse;
import com.apihub.dto.RecentRequest;
import com.apihub.entity.User;
import com.apihub.repository.ApiRepository;
import com.apihub.repository.ApiRequestHistoryRepository;
import com.apihub.repository.ProjectRepository;
import com.apihub.repository.SavedApiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Dashboard numbers are all computed from real rows belonging to the logged-in user. */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final AuthService authService;
    private final ApiRepository apiRepository;
    private final SavedApiRepository savedApiRepository;
    private final ProjectRepository projectRepository;
    private final ApiRequestHistoryRepository historyRepository;

    public DashboardService(AuthService authService, ApiRepository apiRepository,
                            SavedApiRepository savedApiRepository, ProjectRepository projectRepository,
                            ApiRequestHistoryRepository historyRepository) {
        this.authService = authService;
        this.apiRepository = apiRepository;
        this.savedApiRepository = savedApiRepository;
        this.projectRepository = projectRepository;
        this.historyRepository = historyRepository;
    }

    public DashboardResponse get(String email) {
        User user = authService.getByEmail(email);
        List<RecentRequest> recent = historyRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(h -> new RecentRequest(h.getApi().getSlug(), h.getApi().getName(), h.getHttpMethod(),
                        h.getEndpoint(), h.getStatusCode(), h.getDurationMs(), h.getCreatedAt()))
                .toList();
        return new DashboardResponse(
                apiRepository.count(),
                savedApiRepository.countByUserId(user.getId()),
                projectRepository.countByOwnerId(user.getId()),
                historyRepository.countByUserId(user.getId()),
                recent);
    }
}
