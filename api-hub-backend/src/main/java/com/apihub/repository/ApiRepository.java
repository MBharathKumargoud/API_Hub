package com.apihub.repository;

import com.apihub.entity.Api;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApiRepository extends JpaRepository<Api, Long> {

    Optional<Api> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Directory search. Every filter is optional (pass null to ignore it).
     * "pattern" must already be lower-case and wrapped in % signs, e.g. "%weather%".
     */
    @Query("""
            select a from Api a
            where (:pattern is null
                   or lower(a.name) like :pattern
                   or lower(a.provider) like :pattern
                   or lower(a.category) like :pattern
                   or lower(a.description) like :pattern)
              and (:category is null or a.category = :category)
              and (:provider is null or a.provider = :provider)
            order by a.id
            """)
    List<Api> search(@Param("pattern") String pattern,
                     @Param("category") String category,
                     @Param("provider") String provider);

    @Query("select distinct a.category from Api a order by a.category")
    List<String> findDistinctCategories();

    @Query("select distinct a.provider from Api a order by a.provider")
    List<String> findDistinctProviders();

    @Query("select a.baseUrl from Api a where a.baseUrl is not null")
    List<String> findAllBaseUrls();
}
