package com.apihub.repository;

import com.apihub.entity.SavedApi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavedApiRepository extends JpaRepository<SavedApi, Long> {

    @Query("select s.api.slug from SavedApi s where s.user.id = :userId order by s.savedAt desc")
    List<String> findSavedSlugsByUserId(@Param("userId") Long userId);

    Optional<SavedApi> findByUserIdAndApiId(Long userId, Long apiId);

    long countByUserId(Long userId);
}
