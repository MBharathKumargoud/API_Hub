package com.apihub.controller;

import com.apihub.service.SavedApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-apis")
public class SavedApiController {

    private final SavedApiService savedApiService;

    public SavedApiController(SavedApiService savedApiService) {
        this.savedApiService = savedApiService;
    }

    /** Returns the ids (slugs) of the logged-in user's saved APIs, e.g. ["openai","stripe"]. */
    @GetMapping
    public List<String> list(Authentication authentication) {
        return savedApiService.listSavedSlugs(authentication.getName());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> save(@PathVariable("id") String id, Authentication authentication) {
        savedApiService.save(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unsave(@PathVariable("id") String id, Authentication authentication) {
        savedApiService.unsave(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
