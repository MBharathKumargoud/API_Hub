package com.apihub.service;

import com.apihub.entity.Api;
import com.apihub.entity.SavedApi;
import com.apihub.entity.User;
import com.apihub.repository.SavedApiRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** The "Save API" bookmark feature (replaces the browser's localStorage list). */
@Service
@Transactional
public class SavedApiService {

    private final SavedApiRepository savedApiRepository;
    private final AuthService authService;
    private final ApiService apiService;

    public SavedApiService(SavedApiRepository savedApiRepository, AuthService authService, ApiService apiService) {
        this.savedApiRepository = savedApiRepository;
        this.authService = authService;
        this.apiService = apiService;
    }

    @Transactional(readOnly = true)
    public List<String> listSavedSlugs(String email) {
        User user = authService.getByEmail(email);
        return savedApiRepository.findSavedSlugsByUserId(user.getId());
    }

    /** Idempotent: saving an already-saved API does nothing. */
    public void save(String email, String slug) {
        User user = authService.getByEmail(email);
        Api api = apiService.findEntity(slug);
        if (savedApiRepository.findByUserIdAndApiId(user.getId(), api.getId()).isEmpty()) {
            SavedApi saved = new SavedApi();
            saved.setUser(user);
            saved.setApi(api);
            savedApiRepository.save(saved);
        }
    }

    /** Idempotent: removing an API that is not saved does nothing. */
    public void unsave(String email, String slug) {
        User user = authService.getByEmail(email);
        Api api = apiService.findEntity(slug);
        savedApiRepository.findByUserIdAndApiId(user.getId(), api.getId())
                .ifPresent(savedApiRepository::delete);
    }
}
