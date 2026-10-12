package com.apihub.repository;

import com.apihub.entity.ApiRequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApiRequestHistoryRepository extends JpaRepository<ApiRequestHistory, Long> {

    long countByUserId(Long userId);

    List<ApiRequestHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
