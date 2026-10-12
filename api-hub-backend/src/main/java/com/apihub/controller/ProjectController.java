package com.apihub.controller;

import com.apihub.dto.ProjectRequest;
import com.apihub.dto.ProjectResponse;
import com.apihub.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> list(Authentication authentication) {
        return projectService.list(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(@Valid @RequestBody ProjectRequest request, Authentication authentication) {
        return projectService.create(authentication.getName(), request);
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable("id") Long id, Authentication authentication) {
        return projectService.get(authentication.getName(), id);
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable("id") Long id, @Valid @RequestBody ProjectRequest request,
                                  Authentication authentication) {
        return projectService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id, Authentication authentication) {
        projectService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
