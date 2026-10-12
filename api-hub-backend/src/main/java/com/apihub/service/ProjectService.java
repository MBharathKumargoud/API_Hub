package com.apihub.service;

import com.apihub.dto.ProjectRequest;
import com.apihub.dto.ProjectResponse;
import com.apihub.entity.Project;
import com.apihub.entity.User;
import com.apihub.exception.ResourceNotFoundException;
import com.apihub.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Every method looks projects up by (id AND owner), so a user can never read, change
 * or delete someone else's project. Another user's project simply looks like "not found" (404).
 */
@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AuthService authService;

    public ProjectService(ProjectRepository projectRepository, AuthService authService) {
        this.projectRepository = projectRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list(String email) {
        User user = authService.getByEmail(email);
        return projectRepository.findByOwnerIdOrderByUpdatedAtDesc(user.getId())
                .stream().map(ProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse get(String email, Long id) {
        return ProjectResponse.from(findOwned(email, id));
    }

    public ProjectResponse create(String email, ProjectRequest request) {
        Project project = new Project();
        project.setOwner(authService.getByEmail(email));
        project.setName(request.name().trim());
        project.setDescription(clean(request.description()));
        return ProjectResponse.from(projectRepository.save(project));
    }

    public ProjectResponse update(String email, Long id, ProjectRequest request) {
        Project project = findOwned(email, id);
        project.setName(request.name().trim());
        project.setDescription(clean(request.description()));
        return ProjectResponse.from(projectRepository.save(project));
    }

    public void delete(String email, Long id) {
        projectRepository.delete(findOwned(email, id));
    }

    private Project findOwned(String email, Long id) {
        User user = authService.getByEmail(email);
        return projectRepository.findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private static String clean(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
